import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmotionAnalysis {
  primaryEmotion: string;
  intensity: number;
  detectedEmotions: Record<string, number>;
  context: string;
}

interface Message {
  role: string;
  content: string;
}

interface PsychologyAssessment {
  identified_concerns: string[];
  suggested_questions: string[];
  data_gaps: string[];
  preliminary_observations: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, conversationHistory, emotionalHistory, userProfile } = await req.json();

    const emotionAnalysis = analyzeEmotion(message, conversationHistory, emotionalHistory);
    const psychologyAssessment = assessPsychologically(message, conversationHistory, userProfile);

    const response = generateCompanionResponse(
      message,
      conversationHistory || [],
      emotionAnalysis,
      emotionalHistory || [],
      psychologyAssessment,
      userProfile
    );

    return new Response(
      JSON.stringify({
        response,
        emotionAnalysis,
        psychologyAssessment,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function analyzeEmotion(message: string, conversationHistory: Message[], emotionalHistory: EmotionAnalysis[]): EmotionAnalysis {
  const lowercaseMsg = message.toLowerCase();
  const detectedEmotions: Record<string, number> = {};

  const emotionKeywords = {
    anger: {
      keywords: ['angry', 'furious', 'mad', 'frustrated', 'annoyed', 'irritated', 'hate', 'rage', 'upset', 'outraged', 'livid', 'incensed', 'enraged', 'seething', 'indignant', 'resentful', 'cross', 'irate', 'wrathful'],
      weight: 1.0
    },
    disgust: {
      keywords: ['disgusted', 'disgusting', 'repulsed', 'sick', 'vile', 'gross', 'revolting', 'abhorrent', 'loathsome', 'contempt', 'repugnant', 'nauseating', 'repellent', 'detestable', 'sickening'],
      weight: 1.0
    },
    fear: {
      keywords: ['afraid', 'scared', 'terrified', 'anxious', 'nervous', 'panic', 'dread', 'worried', 'threatened', 'frightened', 'petrified', 'apprehensive', 'alarmed', 'aghast', 'spooked', 'uneasy', 'fearful', 'anxiousness'],
      weight: 1.0
    },
    sadness: {
      keywords: ['sad', 'depressed', 'unhappy', 'miserable', 'grief', 'mourning', 'devastated', 'heartbroken', 'desolate', 'sorrowful', 'melancholic', 'downhearted', 'despondent', 'forlorn', 'dispirited', 'crestfallen', 'doleful'],
      weight: 1.0
    },
    happiness: {
      keywords: ['happy', 'joyful', 'delighted', 'pleased', 'cheerful', 'elated', 'thrilled', 'ecstatic', 'blissful', 'content', 'wonderful', 'fantastic', 'amazing', 'great', 'excellent', 'glad', 'overjoyed', 'radiant'],
      weight: 1.0
    },
    surprise: {
      keywords: ['surprised', 'shocked', 'astonished', 'amazed', 'startled', 'astounded', 'unexpected', 'taken aback', 'bewildered', 'stunned', 'flabbergasted', 'dumbfounded', 'blindsided', 'caught off guard', 'gobsmacked'],
      weight: 1.0
    },
  };

  for (const [emotion, data] of Object.entries(emotionKeywords)) {
    let score = 0;
    for (const keyword of data.keywords) {
      if (lowercaseMsg.includes(keyword)) {
        score += 0.25;
      }
    }
    if (score > 0) {
      detectedEmotions[emotion] = Math.min(score * data.weight, 1.0);
    }
  }

  const intensityMarkers = {
    high: ['very', 'extremely', 'so', 'really', 'completely', 'totally', '!!!', 'desperately', 'absolutely', 'incredibly'],
    medium: ['quite', 'somewhat', 'fairly', 'kind of', 'sort of', 'rather', 'pretty'],
    low: ['a bit', 'slightly', 'little', 'maybe', 'somewhat', 'a little'],
  };

  let intensityMultiplier = 1.0;
  if (intensityMarkers.high.some(marker => lowercaseMsg.includes(marker))) {
    intensityMultiplier = 1.5;
  } else if (intensityMarkers.medium.some(marker => lowercaseMsg.includes(marker))) {
    intensityMultiplier = 1.1;
  } else if (intensityMarkers.low.some(marker => lowercaseMsg.includes(marker))) {
    intensityMultiplier = 0.7;
  }

  if (message.includes('!!!')) intensityMultiplier *= 1.4;
  else if (message.includes('!!')) intensityMultiplier *= 1.2;
  else if (message.includes('!')) intensityMultiplier *= 1.1;

  if (message === message.toUpperCase() && message.length > 10) intensityMultiplier *= 1.3;

  for (const emotion in detectedEmotions) {
    detectedEmotions[emotion] = Math.min(detectedEmotions[emotion] * intensityMultiplier, 1.0);
  }

  if (emotionalHistory.length > 0) {
    const recentEmotions = emotionalHistory.slice(-5);
    for (const pastState of recentEmotions) {
      if (pastState.detectedEmotions) {
        for (const [emotion, score] of Object.entries(pastState.detectedEmotions)) {
          if (detectedEmotions[emotion]) {
            detectedEmotions[emotion] = Math.min(
              detectedEmotions[emotion] + (score as number) * 0.05,
              1.0
            );
          }
        }
      }
    }
  }

  let primaryEmotion = 'neutral';
  let maxScore = 0;
  for (const [emotion, score] of Object.entries(detectedEmotions)) {
    if ((score as number) > maxScore) {
      maxScore = score as number;
      primaryEmotion = emotion;
    }
  }

  const intensity = maxScore > 0 ? maxScore : 0.3;

  let context = 'initial';
  if (emotionalHistory.length > 0) {
    const recentPrimary = emotionalHistory[0]?.primaryEmotion;
    if (recentPrimary === primaryEmotion) {
      context = 'recurring';
    } else {
      context = 'shifting';
    }
  }

  return {
    primaryEmotion,
    intensity,
    detectedEmotions,
    context,
  };
}

function assessPsychologically(message: string, conversationHistory: Message[], userProfile: any): PsychologyAssessment {
  const lowercaseMsg = message.toLowerCase();
  const identified_concerns: string[] = [];
  const suggested_questions: string[] = [];
  const data_gaps: string[] = [];
  let preliminary_observations = '';

  const concernPatterns = {
    depression: /sad|depressed|hopeless|worthless|suicide|giving up|empty|numb|can't|nothing matters|tired|exhausted|pointless|down|low|unmotivated/i,
    anxiety: /anxious|panic|worry|fear|stress|overwhelming|can't breathe|heart racing|worried|nervous|dread|tense|restless|agitated/i,
    trauma: /trauma|abuse|attack|assault|violation|frightened|trigger|flashback|nightmare|unsafe|hurt|damaged/i,
    relationship: /relationship|partner|spouse|friend|family|conflict|argue|lonely|alone|isolated|disconnected|misunderstood/i,
    work_stress: /work|job|boss|colleague|stress|pressure|deadline|overwhelmed|burned out|exhausted at work/i,
    health: /sick|illness|pain|disease|hospital|medication|doctor|health|injury|ache|hurt|physical/i,
    sleep: /sleep|insomnia|tired|exhausted|nightmare|rest|sleep deprivation|can't sleep|restless|tossing/i,
    substance: /alcohol|drug|smoke|addiction|quit|substance|drinking|using|cocaine|heroin|pills/i,
    grief: /loss|death|died|deceased|gone|miss|memorial|funeral|lost someone|grieving|mourn/i,
  };

  for (const [concern, pattern] of Object.entries(concernPatterns)) {
    if (pattern.test(message)) {
      identified_concerns.push(concern);
    }
  }

  const messageLength = conversationHistory.length;

  if (messageLength === 0) {
    suggested_questions.push('What\'s weighing on you most right now?');
  } else if (identified_concerns.length > 0 && !/cause|reason|began|started|trigger|why/i.test(message)) {
    suggested_questions.push('When did you first notice this beginning?');
  } else if (!/cope|help|manage|deal|strategy|try/i.test(message) && identified_concerns.length > 0) {
    suggested_questions.push('What have you found helps you through this, even just a little?');
  } else if (!/affect|impact|daily|life|work|relationships/i.test(message) && identified_concerns.length > 0) {
    suggested_questions.push('How is this showing up in your daily life right now?');
  } else if (identified_concerns.length > 0 && messageLength > 4) {
    suggested_questions.push('What would need to change for you to feel better?');
  } else {
    suggested_questions.push('What feels most difficult about that?');
  }

  if (identified_concerns.length === 0) {
    preliminary_observations = 'You\'re sharing something with me. I\'m here to understand what matters most to you.';
  } else if (identified_concerns.length === 1) {
    preliminary_observations = `I hear you dealing with ${identified_concerns[0]}. That takes real courage to talk about.`;
  } else {
    preliminary_observations = `I\'m sensing multiple threads in what you\'re sharing. These are connected to your wellbeing, and I want to understand each one.`;
  }

  return {
    identified_concerns,
    suggested_questions,
    data_gaps,
    preliminary_observations,
  };
}

function generateCompanionResponse(
  message: string,
  conversationHistory: Message[],
  emotionAnalysis: EmotionAnalysis,
  emotionalHistory: EmotionAnalysis[],
  psychologyAssessment: PsychologyAssessment,
  userProfile: any
): string {
  const { primaryEmotion, intensity, context } = emotionAnalysis;
  const { identified_concerns, suggested_questions, preliminary_observations } = psychologyAssessment;

  const responses = {
    anger: {
      high: [
        "I can hear how intensely frustrated you are right now. That level of anger often points to something fundamental that's been violated or disrespected. What feels most unfair about this situation?",
        "Your anger is completely valid. When we feel this intensely, it's usually because something we deeply value is at stake. What core value or boundary do you feel has been crossed?",
        "I hear the strength in your words. Anger this powerful often carries important information. Rather than suppress it, let's understand what it's telling us about what matters to you.",
      ],
      medium: [
        "Something's clearly bothering you, and I want to understand what. What specifically triggered this feeling?",
        "I sense frustration beneath your words. Often, irritation points to unmet needs. What do you wish was different?",
      ],
      low: [
        "I notice a bit of frustration. Even small irritations can accumulate. What's been building up?",
      ],
    },
    disgust: {
      high: [
        "I can feel the intensity of your revulsion. Disgust often emerges when we encounter something that violates our values or sense of integrity. What feels most unacceptable to you?",
        "Your strong reaction tells me something important matters deeply to you. What exactly triggers this feeling of disgust?",
      ],
      medium: [
        "Something's clearly not sitting right with you. What about this situation feels wrong or unacceptable?",
      ],
      low: [
        "I sense something you find off-putting. What would need to change?",
      ],
    },
    fear: {
      high: [
        "I can feel how frightened you are, and I want you to know that fear is an important signal. It's showing us what feels threatening. What specifically are you most afraid will happen?",
        "This level of fear deserves attention. Rather than fight it, let's explore it together. What's the worst outcome you're imagining?",
        "Your fear is real and valid. Fear protects us, but sometimes it can become overwhelming. What would help you feel safer right now?",
      ],
      medium: [
        "There's worry in what you're sharing. What feels most uncertain or risky to you?",
        "I sense anxiety about something specific. Can you describe what concerns you most?",
      ],
      low: [
        "I notice some nervousness. What's creating this uncertainty?",
      ],
    },
    sadness: {
      high: [
        "I can feel the depth of your sadness, and I'm here to listen. This level of pain often indicates significant loss. What feels most lost or absent in your life right now?",
        "Your sadness is profound and deserves compassionate attention. Is this connected to a specific loss, or is it more a general heaviness?",
        "The weight you're carrying sounds immense. Can you tell me what you're grieving?",
      ],
      medium: [
        "You sound down, and I'd like to understand why. What's been weighing on you?",
        "I hear sadness in your words. What's the situation that's bringing this up?",
      ],
      low: [
        "You seem a bit low today. What's on your mind?",
      ],
    },
    happiness: {
      high: [
        "Your joy is beautiful to witness. Moments like this reveal what truly brings meaning to our lives. What about this is making you feel so good?",
        "This kind of happiness is precious. Tell me more—what's creating this sense of fulfillment?",
      ],
      medium: [
        "I'm glad you're feeling positive. What's brought this brightness?",
        "There's something uplifting in what you're sharing. I'd love to hear more.",
      ],
      low: [
        "I sense a glimmer of positivity. What's helping, even if it's small?",
      ],
    },
    surprise: {
      high: [
        "Something significant has clearly caught you off-guard. How are you processing this unexpected development?",
        "You sound genuinely shocked. What about this surprised you most?",
      ],
      medium: [
        "Something unexpected happened. What's your take on it now that you've had a moment?",
      ],
      low: [
        "Something's not quite what you expected. How are you adjusting?",
      ],
    },
    neutral: {
      high: [
        "I'm listening and present with you. What would you like to explore or talk about?",
        "You have my full attention. Please share what's on your mind.",
      ],
      medium: [
        "I'm here to understand your experience. What feels important to discuss?",
      ],
      low: [
        "What brings you here today?",
      ],
    },
  };

  let intensityLevel: 'high' | 'medium' | 'low';
  if (intensity > 0.7) intensityLevel = 'high';
  else if (intensity > 0.4) intensityLevel = 'medium';
  else intensityLevel = 'low';

  const emotionResponses = responses[primaryEmotion as keyof typeof responses] || responses.neutral;
  const levelResponses = emotionResponses[intensityLevel];
  const baseResponse = levelResponses[Math.floor(Math.random() * levelResponses.length)];

  let additionalInsights = '';

  if (preliminary_observations) {
    additionalInsights += ` ${preliminary_observations}`;
  }

  if (context === 'recurring' && intensity > 0.5) {
    additionalInsights += ` I've noticed this pattern emerging across our conversations. This consistency suggests it's something worth exploring more deeply.`;
  }

  if (conversationHistory.length > 8) {
    additionalInsights += ` As we continue talking, I'm gaining a better understanding of what you're experiencing. I'd like to help you find not just coping strategies, but genuine understanding.`;
  }

  let followUpQuestion = '';
  if (suggested_questions.length > 0) {
    followUpQuestion = ` ${suggested_questions[0]}`;
  }

  return baseResponse + additionalInsights + followUpQuestion;
}
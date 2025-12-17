export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { content, userProfile, chapterTitle } = await req.json();

    if (!content || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'Missing content or userProfile' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = buildPersonalizationPrompt(userProfile);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Please personalize the following chapter content for me:\n\nChapter: ${chapterTitle}\n\n${content}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to personalize content' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const personalizedContent = data.content[0].text;

    return new Response(
      JSON.stringify({ personalizedContent }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Personalization error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function buildPersonalizationPrompt(userProfile) {
  const {
    name,
    personalizedLevel,
    programmingExperience,
    programmingLanguages,
    hardwareExperience,
    roboticsExperience,
    learningGoals,
  } = userProfile;

  // Parse JSON strings if needed
  const languages =
    typeof programmingLanguages === 'string'
      ? JSON.parse(programmingLanguages || '[]')
      : programmingLanguages || [];
  const goals =
    typeof learningGoals === 'string'
      ? JSON.parse(learningGoals || '[]')
      : learningGoals || [];

  return `You are an expert robotics educator personalizing textbook content for ${name || 'the student'}.

## Student Profile
- Overall Level: ${personalizedLevel || 'beginner'}
- Programming Experience: ${programmingExperience || 'not specified'}
- Known Languages: ${languages.join(', ') || 'not specified'}
- Hardware Experience: ${hardwareExperience || 'not specified'}
- Robotics Experience: ${roboticsExperience || 'not specified'}
- Learning Goals: ${goals.join(', ') || 'not specified'}

## Personalization Guidelines

Based on the student's level (${personalizedLevel}):

### For Beginners:
- Add more context and background explanations
- Define technical terms when first introduced
- Include analogies to everyday concepts
- Break complex code into smaller steps with comments
- Add "Why this matters" sections
- Simplify prerequisites

### For Intermediate:
- Maintain technical depth but clarify advanced concepts
- Add practical tips and common pitfalls
- Include optimization suggestions
- Connect to real-world applications
- Reference the student's known languages (${languages.join(', ')})

### For Advanced:
- Focus on edge cases and performance considerations
- Add advanced alternatives and trade-offs
- Include references to papers or advanced resources
- Discuss architectural decisions
- Suggest extensions and challenges

## Output Format
- Return the personalized content in the same format (markdown with HTML elements)
- Preserve all code blocks, headers, and structure
- Keep all links and images intact
- Add personalized callout boxes where helpful using: <div class="personalized-note">Note for you: ...</div>
- Do NOT add introductory phrases like "Here is the personalized content"
- Return ONLY the personalized chapter content`;
}

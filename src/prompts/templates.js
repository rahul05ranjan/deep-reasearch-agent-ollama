// Prompt templates for different research tasks

export const prompts = {
  
  // Analyze and structure a research topic
  topicAnalysis: `You are an expert research analyst. Given a research topic, break it down into key subtopics that should be explored.

Topic: {topic}
Research Mode: {mode}

Please provide:
1. A brief overview of why this topic is important
2. 3-5 key subtopics that should be researched
3. The main questions that need to be answered

Format your response as a JSON object with this structure:
{
  "overview": "Brief explanation of topic importance",
  "subtopics": [
    {
      "title": "Subtopic name",
      "description": "What this subtopic covers",
      "questions": ["question1", "question2"]
    }
  ],
  "mainQuestions": ["key question 1", "key question 2"]
}`,

  // Generate comprehensive research content
  researchContent: `You are a knowledgeable researcher writing a comprehensive section about a specific subtopic.

Main Topic: {mainTopic}
Subtopic: {subtopic}
Focus: {description}
Key Questions: {questions}

Please provide a detailed, well-structured research summary that covers:
1. Key concepts and definitions
2. Current state and recent developments
3. Important facts, statistics, or examples
4. Challenges or limitations
5. Future outlook or trends

Write in a clear, informative style suitable for an educated audience. Include specific details and examples where relevant.`,

  // Generate follow-up questions
  followUpQuestions: `Based on the research conducted on "{topic}", generate 5-7 thoughtful follow-up questions that would help deepen understanding of this topic.

Research Summary: {summary}

The questions should:
- Explore different angles or perspectives
- Address practical applications
- Consider implications or consequences
- Suggest related areas for investigation

Format as a simple list of questions.`,

  // Create a synthesis summary
  synthesisPrompt: `You are tasked with creating a comprehensive synthesis of research on "{topic}".

Here are the individual research sections:
{sections}

Please create a cohesive summary that:
1. Integrates the key findings from all sections
2. Identifies major themes and patterns
3. Highlights the most important insights
4. Notes any contradictions or gaps
5. Provides an overall assessment

Structure your response with clear headings and maintain an objective, analytical tone.`,

  // Suggest related research areas
  relatedTopics: `Based on the research conducted on "{topic}", suggest 5 related topics that would be interesting to explore next.

Research Context: {context}

For each related topic, provide:
- The topic name
- A brief explanation of how it connects to the original research
- Why it would be valuable to investigate

Format as a numbered list.`,

  // Create executive summary
  executiveSummary: `Create a concise executive summary of the research on "{topic}".

Full Research: {fullResearch}

The summary should be 3-4 paragraphs that capture:
1. The main findings and insights
2. Key implications or applications
3. Most significant conclusions
4. Areas for future consideration

Write for a business/academic audience who needs to quickly understand the essential points.`

};

export const getPrompt = (templateName, variables = {}) => {
  const template = prompts[templateName];
  if (!template) {
    throw new Error(`Prompt template "${templateName}" not found`);
  }

  let prompt = template;
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  }

  return prompt;
};

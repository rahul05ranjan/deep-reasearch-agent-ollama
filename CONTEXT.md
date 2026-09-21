# Smart Research Assistant

A local research product that turns a research topic and a research mode into a research report, using a language model.

## Language

**Research Topic**:
The subject the user wants investigated.
_Avoid_: query, prompt, question (when referring to the whole run)

**Research Mode**:
A named depth and emphasis for a research run: Comprehensive, Quick, Technical, Comparative, or Historical.
_Avoid_: preset, strategy, style

**Topic Analysis**:
A structured breakdown of a research topic produced before subtopic research, containing an overview, subtopics, and main questions.
_Avoid_: plan, outline, breakdown

**Subtopic**:
One titled slice of a research topic, with a description and questions to pursue.
_Avoid_: section, chapter, theme

**Research Finding**:
The prose and metadata produced for a single subtopic during a research run.
_Avoid_: article, content blob

**Research Report**:
The complete result of a research run: the topic, mode, topic analysis, findings keyed by subtopic title, optional synthesis, follow-up questions, executive summary, and performance stats.
_Avoid_: result object, payload, output

**Synthesis**:
A single prose integration of all research findings in a run.
_Avoid_: summary (that word is reserved for the executive summary)

**Follow-up Question**:
A question suggested after a research run to deepen investigation of the same topic.
_Avoid_: next step, related topic

**Executive Summary**:
A short prose digest of the research report for a reader who will not read every finding.
_Avoid_: abstract, blurb, overview (overview belongs to topic analysis)

**Research Engine**:
The headless pipeline that produces a research report from a research topic and options.
_Avoid_: ResearchAgent, orchestrator, service

**LLM Client**:
The seam through which the research engine asks a language model to generate text and to list available models.
_Avoid_: Ollama (the production adapter, not the seam), API wrapper

**CLI Assistant**:
The command-line actor that collects a research topic and options and displays a research report.
_Avoid_: SmartResearchAssistant as the pipeline itself

**Research Request**:
The input that starts a research run from the web: a research topic, a research mode, and flags for synthesis and follow-up questions.
_Avoid_: body, payload, form data

**Progress Event**:
A named stage update emitted while a research run is in progress.
_Avoid_: log line, callback, hook

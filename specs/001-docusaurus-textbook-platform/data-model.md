# Data Model: Physical AI & Humanoid Robotics Textbook Platform

## User Entity
- **user_id**: Unique identifier for each registered user
- **email**: User's email address (required for authentication)
- **username**: Display name for the user
- **created_at**: Timestamp when user account was created
- **last_login**: Timestamp of most recent login
- **hardware_profile**: Embedded object containing:
  - **gpu_model**: String representing the user's GPU model (e.g., "RTX 4090", "RTX 3080", "Jetson Nano")
  - **has_jetson**: Boolean indicating if user has Jetson hardware
  - **real_robot_type**: String describing the type of real robot user has access to (e.g., "None", "TurtleBot3", "Unitree Go1", "Other")

## Chapter Entity
- **chapter_id**: Unique identifier for each chapter
- **title**: The title of the chapter
- **slug**: URL-friendly identifier for the chapter
- **content**: The main content of the chapter in MDX format
- **urdu_content**: The Urdu translation of the chapter content
- **chapter_number**: Sequential number (1-13) indicating position in the textbook
- **title_english**: English title of the chapter
- **title_urdu**: Urdu title of the chapter
- **mermaid_diagrams**: Collection of Mermaid diagram code snippets
- **code_examples**: Collection of ROS2/Python code examples with metadata
- **key_takeaways**: List of key points from the chapter
- **practice_exercises**: Collection of practice exercises with solutions
- **mcq_quiz**: Collection of 5 multiple-choice questions with answers and explanations
- **further_reading**: List of additional resources for the topic

## Quiz Entity
- **quiz_id**: Unique identifier for each quiz
- **chapter_id**: Reference to the chapter this quiz belongs to
- **questions**: Collection of question objects, each with:
  - **question_id**: Unique identifier for the question
  - **question_text**: The text of the multiple-choice question
  - **options**: Array of possible answer choices
  - **correct_answer**: The correct option
  - **explanation**: Explanation for why the answer is correct
  - **urdu_question**: Urdu translation of the question
  - **urdu_options**: Urdu translations of the answer options
  - **urdu_explanation**: Urdu translation of the explanation

## Content Personalization Entity
- **personalization_id**: Unique identifier for each personalization rule
- **chapter_id**: Reference to the chapter containing personalized content
- **content_block**: The content block that can be personalized
- **condition**: The hardware condition that triggers this personalization
- **personalized_content**: The content to display when condition is met
- **fallback_content**: The default content when condition is not met
- **language**: The language version (English/Urdu) for this personalization

## Session Entity
- **session_id**: Unique identifier for each user session
- **user_id**: Reference to the authenticated user
- **started_at**: Timestamp when the session started
- **last_activity**: Timestamp of the last activity in the session
- **active_chapter**: The chapter the user was last viewing
- **progress**: Object tracking user's progress in the textbook
  - **completed_chapters**: Array of chapter IDs the user has completed
  - **quiz_scores**: Object mapping chapter IDs to quiz scores
  - **last_accessed**: Timestamp of when the user last accessed content

## RAG Context Entity
- **context_id**: Unique identifier for each RAG context entry
- **source_type**: Type of source (e.g., "chapter", "exercise", "diagram")
- **source_id**: Reference to the source entity (chapter_id, exercise_id, etc.)
- **content_text**: The text content that will be used for RAG
- **urdu_content_text**: Urdu version of the content for multilingual queries
- **embedding_vector**: The vector representation of the content for similarity search
- **metadata**: Additional information for retrieval context
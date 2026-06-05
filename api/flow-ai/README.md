# Flow IA API contract

The current ReveeFlow frontend includes a local operational engine for Flow IA. These endpoints define the backend shape for the Supabase/OpenAI deployment.

## Endpoints

- `POST /api/flow-ai/chat`
  - Receives `{ message, screen, context }`
  - Returns `{ message, actions, recommendations }`

- `GET /api/flow-ai/context`
  - Returns the current operational context: user, permissions, work settings, projects, tasks, events, notes, services, timeline and AI memory.

- `POST /api/flow-ai/calculate-deadline`
  - Receives project/service scope.
  - Returns minimum delivery, comfortable delivery, best start date, risk level and risk reason.

- `POST /api/flow-ai/organize-day`
  - Returns the recommended main task, the next three tasks, suggested time blocks and what can wait.

- `POST /api/flow-ai/organize-week`
  - Returns weekly distribution, critical days, deadline risks and suggested changes.

- `POST /api/flow-ai/reorganize-timeline`
  - Returns a suggested timeline payload. It must not mutate data until confirmed.

- `POST /api/flow-ai/create-tasks-from-dump`
  - Receives free text and returns structured task suggestions.

- `POST /api/flow-ai/apply-suggestion`
  - Applies a confirmed suggestion such as creating tasks, changing dates or reordering timeline.

## Guardrails

Flow IA is operational only. It must not generate posts, captions, marketing copy, creative assets, financial analysis or approval workflows.

Any mutation requires explicit confirmation from the user.

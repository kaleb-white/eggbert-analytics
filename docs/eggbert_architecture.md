## Implementing Clean Architecture in Eggbert

![Good pic for understanding clean architecture in eggbert](/docs/pictures/ocp%20split.png)

This Unified Modeling Language Diagram from Robert C. Martin's _Clean Architecture_ generally mirrors the component setup of eggbert.

### Project File Structure

- app: routing
- docs: documentation, including guides, conventions
  - pictures: pictures for documentation
- entities: contains the project entities
  - interfaces: APIs for the outside world to implement
  - surveys: survey-related entities, such as survey, transcript, turn, modelDialoguePrompt
  - users: user-related entities
- public: public assets, statically hosted by next
- tests: the tests, current tightly coupled
  - entities: tests for entities
    - specific: tests that are very tightly coupled and tests that simple methods are doing what they should be
  - ui: tests for ui presenters
- ui: contains the ui implementation
  - icons: svg icons for use in the ui
- use_cases: application business rules
  - surveys: application business rules related to surveys

### Testing

TODO

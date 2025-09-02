## Implementing Clean Architecture in Eggbert

![Good pic for understanding clean architecture in eggbert](/docs/pictures/ocp%20split.png)

This Unified Modeling Language Diagram from Robert C. Martin's _Clean Architecture_ generally mirrors the component setup of eggbert.

### Project File Structure (DO NOT CHANGE THIS HEADER, GIT HOOK DEPENDS ON IT)

-   app: routing
-   core: core logic (entities, use cases, interactors, gateways, controllers)
    -   entities: contains the project entities
        -   interfaces: APIs for the outside world to implement
        -   surveys: survey-related entities, such as survey, transcript, turn, modelDialoguePrompt
        -   users: user-related entities
    -   gateways: folder has no description
        -   surveys: folder has no description
            -   interfaces: folder has no description
    -   use_cases: application business rules
        -   auth: folder has no description
            -   cryptography: folder has no description
            -   interfaces: folder has no description
        -   surveys: application business rules related to surveys
            -   interfaces: folder has no description
            -   model: folder has no description
-   docs: documentation, including guides, conventions
    -   pictures: pictures for documentation
-   git_hooks: folder has no description
-   public: public assets, statically hosted by next
    -   svg_icons: folder has no description
-   stable_utilities: folder has no description
-   tests: the tests, current tightly coupled
    -   entities: tests for entities
        -   specific: tests that are very tightly coupled and tests that simple methods are doing what they should be
    -   stable_utilities: folder has no description
        -   icons: folder has no description
            -   tests: folder has no description
    -   use_cases: folder has no description
        -   surveys: folder has no description
            -   model: folder has no description
-   ui: contains the ui implementation
    -   icons: svg icons for use in the ui

### Testing

TODO

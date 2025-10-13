## Implementing Clean Architecture in Eggbert

![Good pic for understanding clean architecture in eggbert](/docs/pictures/ocp%20split.png)

This Unified Modeling Language Diagram from Robert C. Martin's _Clean Architecture_ generally mirrors the component setup of eggbert.

### Project File Structure (DO NOT CHANGE THIS HEADER, GIT HOOK DEPENDS ON IT)

-   app: routing
-   core: core logic (entities, use cases, interactors, gateways, controllers)
    -   entities: contains the project entities
        -   surveys: survey-related entities, such as survey, response, question response, question, turn
        -   users: user-related entities
    -   gateways: contains the classes that translate between external frameworks and business rules
        -   external: gateways which interact with external components
            -   external: folder has no description
            -   internal: folder has no description
        -   internal: gateways which implement interfaces that entities require
    -   use_cases: application business rules
        -   auth: business rules related to authentication
            -   cryptography: implements the cryptography utilities utilized by entities
-   docs: documentation, including guides, conventions
    -   pictures: pictures for documentation
    -   user_stories: user stories for eggbert (not sure if this will be used yet)
-   entrypoints: 'main' function
    -   redis-cli: 'main' function which uses redis as a cache (not working)
-   model_client_proxy: a websocket server that bounces traffic to and from the model
    -   core: includes entities, gateways, etc
        -   entities: folder has no description
        -   gateways: folder has no description
            -   client_gateway: folder has no description
            -   server_gateway: folder has no description
        -   use_cases: folder has no description
            -   query_model: folder has no description
    -   tests: folder has no description
        -   run_test_server: folder has no description
        -   use_cases: folder has no description
-   persistent_storage: folder has no description
    -   cpp_cache: folder has no description
        -   cache_gateway: folder has no description
            -   ts: folder has no description
                -   utilities: folder has no description
        -   comand_line_parser: folder has no description
        -   headers: folder has no description
            -   classes: folder has no description
            -   doctest: folder has no description
            -   utils: folder has no description
        -   input_parser: folder has no description
        -   io: folder has no description
        -   lru: folder has no description
        -   main_tests: folder has no description
        -   objects: folder has no description
        -   use_cases: folder has no description
    -   postgres_db: folder has no description
        -   initialization: contains sql for resetting the database and a script to run it
        -   sql_generators_by_entity: functions to generate sql for CRUD operations
        -   sql_generators_by_table: functions that provide helper methods for specific tables
    -   redis: redis cache implementations
-   public: public assets, statically hosted by next
    -   svg_icons: project icons
-   stable_utilities: simple, easily testable functions that will not change and can be depended on universally (such as type checks for interfaces)
    -   git_hooks: self explanatory
-   tests: the tests, current tightly coupled
    -   core: tests of the core logic
        -   entities: folder has no description
            -   specific: folder has no description
        -   gateways: folder has no description
    -   db: tests for postgres_db
        -   utilities: utilities to use in test, such as initializing a test db
    -   stable_utilities: tests for stable utilities
    -   ui: tests for the ui
        -   icons: tests for icon creation script
-   ui: contains the ui implementation
    -   icons: svg icons for use in the ui

### Testing

TODO

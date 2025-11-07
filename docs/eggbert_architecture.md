## Implementing Clean Architecture in Eggbert

![Good pic for understanding clean architecture in eggbert](/docs/pictures/ocp%20split.png)

This Unified Modeling Language Diagram from Robert C. Martin's _Clean Architecture_ generally mirrors the component setup of eggbert.

### Project File Structure (DO NOT CHANGE THIS HEADER, GIT HOOK DEPENDS ON IT)

-   app: routing
    -   (landing): The home page
    -   api: API routes
        -   responses: API
            -   save_response: Route to save a response to the database, used by proxy
    -   responses: /responses routes
        -   [...response]: slug route (catches any route that is /responses/something)
-   core: core logic (entities, use cases, interactors, gateways, controllers)
    -   entities: contains the project entities
        -   surveys: survey-related entities, such as survey, response, question response, question, turn
        -   users: user-related entities
    -   gateways: contains the classes that translate between external frameworks and business rules
        -   external: gateways which interact with external components
        -   internal: gateways which implement interfaces that entities require
    -   use_cases: application business rules
        -   auth: business rules related to authentication
            -   cryptography: implements the cryptography utilities utilized by entities
-   docs: documentation, including guides, conventions
    -   pictures: pictures for documentation
    -   user_stories: user stories for eggbert (not sure if this will be used yet)
-   entrypoints: 'main' function
    -   test_solo_response: Starts the proxy and cache, creates a sample response, starts the main server
-   model_client_proxy: a websocket server that bounces traffic to and from the model
    -   core: includes entities, gateways, etc
        -   entities: The entities
        -   gateways: The gateways
            -   external: Gateways that serve as external APIs
                -   query_model: Model related external gateways
            -   internal: Gateways that serve as internal APIs
        -   use_cases: Proxy logic, such as handling one websocket connection
    -   tests: Actual test are located in the base folder (whoops, misleading name)
        -   run_test_server: Runs a test server to test some use cases against
-   public: public assets, statically hosted by next
    -   svg_icons: project icons
-   storage: For storing and retrieving entities
    -   cpp_cache: The cache
        -   cache_gateway: Gateways that server as external APIs
            -   ts: Typescript API
                -   utilities: In the name
        -   comand_line_parser: Parses command line input
        -   headers: Header files for use by the runners
            -   classes: Interfaces really
            -   doctest: Single-file testing utility
            -   io: Contains definitions used by both IO implementations (linux/windows)
            -   utils: In the name
        -   input_parser: Parses command input (read, create, delete)
        -   io: IO implementations (socket interaction)
        -   lru: Least Recently Used algorithm implementation
        -   main_tests: Tests
        -   objects: folder has no description
        -   use_cases: Includes the actual cache, which I called TrySaveAndReturnResult for some reason
    -   postgres_db: Postgres database implementation
        -   initialization: SQL + code to execute it which resets a database
        -   sql_generators_by_entity: These are methods which provide external interfaces for saving / retrieving an entity (for example, getSurvey)
        -   sql_generators_by_table: These are methods which provide raw SQL for creating and aggregating JSON entities
    -   redis: folder has no description
-   tests: the tests, current tightly coupled
    -   core: tests of the core logic
        -   entities: ...
            -   specific: ...
        -   gateways: ...
    -   db: tests for postgres_db
        -   utilities: utilities to use in test, such as initializing a test db
    -   model_client_proxy: tests for the proxy server
        -   run_test_server: ...
        -   use_cases: ...
    -   stable_utilities: tests for stable utilities
    -   ui: tests for the ui
        -   icons: tests for icon creation script
-   ui: contains the ui implementation
    -   chat_box: The chat box contained in responses pages
    -   error: A general error page to use
    -   hooks: Custom react hooks
    -   icons: svg icons for use in the ui
    -   messages: Messages within a chat box
    -   navigation: Navigation related UI elements
        -   navbar: The top navbar
        -   qr_scroll: The navbar for navigating between question responses within a response
        -   sidebar: The side navbar
    -   response: Hooks up the chat box and the qr_scroll
    -   response_input: Input bar within the chat box
-   utilities: Universal utilities, such as creating ids, type checking, seeing if a process is running, etc
    -   git_hooks: Git hooks, including the post-commit hook that updates this document!
    -   reconstruct_obj: Functions that reconstruct nested objects

### Testing

TODO

## Implementing Clean Architecture in Eggbert

![Good pic for understanding clean architecture in eggbert](/docs/pictures/ocp%20split.png)

This Unified Modeling Language Diagram from Robert C. Martin's _Clean Architecture_ generally mirrors the component setup of eggbert.

### Project File Structure (DO NOT CHANGE THIS HEADER, GIT HOOK DEPENDS ON IT)

-   .vscode: folder has no description
-   app: routing
-   core: core logic (entities, use cases, interactors, gateways, controllers)
	-   entities: contains the project entities
		-   surveys: survey-related entities, such as survey, transcript, turn, modelDialoguePrompt
		-   users: user-related entities
	-   gateways: contains the classes that translate between external frameworks and business rules
		-   surveys: translations to and from surveys
	-   use_cases: application business rules
		-   auth: business rules related to authentication
			-   cryptography: implements the cryptography utilities utilized by entities
		-   surveys: application business rules related to surveys
-   docs: documentation, including guides, conventions
	-   pictures: pictures for documentation
	-   user_stories: folder has no description
-   entrypoints: folder has no description
	-   redis-cli: folder has no description
-   model_client_proxy: folder has no description
	-   core: folder has no description
		-   entities: folder has no description
		-   gateways: folder has no description
			-   client_gateway: folder has no description
			-   server_gateway: folder has no description
		-   use_cases: folder has no description
			-   query_model: folder has no description
	-   model: folder has no description
	-   tests: folder has no description
		-   run_test_server: folder has no description
		-   use_cases: folder has no description
-   persistent_storage: folder has no description
	-   cache_gateway: folder has no description
		-   ts: folder has no description
			-   utilities: folder has no description
	-   cpp_cache: folder has no description
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
	-   surveys: folder has no description
-   public: public assets, statically hosted by next
	-   svg_icons: project icons
-   stable_utilities: simple, easily testable functions that will not change and can be depended on universally (such as type checks for interfaces)
	-   git_hooks: folder has no description
-   tests: the tests, current tightly coupled
	-   entities: tests for entities
		-   specific: tests that are very tightly coupled and tests that simple methods are doing what they should be
	-   stable_utilities: tests for stable utilities
	-   ui: tests for the ui
		-   icons: tests for icon creation script
	-   use_cases: tests for use cases
		-   surveys:
			-   model: test cases related to use cases survey interactions
-   ui: contains the ui implementation
	-   icons: svg icons for use in the ui



### Testing

TODO

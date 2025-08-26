# Clean Architecture

Clean architecture is a design philosophy that emphasizes a separation of concerns, decoupling, in order to create modular codebases.

![Clean architecture simple diagram](https://cdn-media-1.freecodecamp.org/images/YsN6twE3-4Q4OYpgxoModmx29I8zthQ3f0OR)

## Why Clean Architecture?

Clean architecture is an encompassing philosophy that doesn't prescribe details like folders, frameworks, databases, etc. Rather, it describes a set of principles ([SOLID principles](#solid-design-principles-and-their-architectural-implications)) which center on the concept of dependency inversion. Regardless of the structure or use of the codebase, SOLID principles emhpasize that core features should be depended upon, not depend on others. This modularity inspires ease of change, extension, and use.

## Definitions and Concepts in Clean Architecture

#### Dependency Inversion

Imagine a simple racing game. The game is divided into three modules: the graphics engine, the game engine, and interaction engine. The graphics engine is responsible for understanding how to draw a car, calculate camera angles, compute lighting, and so on. The game engine is responsible for physics calculations and car and track details, and is dependent on the graphics engine for displaying the track, cars, and so on. The interaction engine is responsible for taking user input and validating or invalidating it based on the state of the game (for example, a car can't go left if it is adjacent to a barrier on the left). It is dependent on the game engine.

Say there exists a function in the graphics engine (written in python for some reason) that calculates the reflection between steel and air.

```python
def calculate_reflection_between_steel_air(incident_angle: float, transmission_angle: float) -> float:
    STEEL_REFRACTIVE_IDX = 2.1849 # wavelength 587.6 nm
    AIR_REFRACTIVE_IDX = 1.0003 # wavelengh 587.6 nm
    return ((STEEL_REFRACTIVE_IDX * cos(incident_angle) - AIR_REFRACTIVE_IDX * cos(transmission_angle)) / (STEEL_REFRACTIVE_IDX * cos(incident_angle) + AIR_REFRACTIVE_IDX * cos(transmission_angle))) ** 2
```

The developer of the graphics engine wants to refactor this function:

```python
def calculate_reflection_between_steel_air(incident_angle: float, transmission_angle: float, wavelength: float) -> float:
    ...
```

It seems like a good change - the first function would only be able to calculate the reflection of yellow light, light with a wavelength of 570 - 590 nm. However, say it breaks the interaction engine - perhaps certain reflection of yellow light, in this game, disable the drivers control, and the new parameter causes an error in the interaction engine's intrepretation. The interaction engine depends on this function, so now the interaction engine needs to be changed. This isn't a huge issue - except that every change in the graphics engine can lead to changes in the game engine and the interaction engine. What if the graphics engine undergoes a thorough redesign? The interaction and game engines would also need to change significantly.

Dependency inversion is the practice of sticking an interface between dependencies, so both the callee and caller are dependent on the interface.

The dependency graph currrently looks like this:

Graphics Engine <-- Game Engine <-- Interaction Engine

Adding dependency inversion changes the dependency graph to look like this:

Graphics Engine Impl --> Graphics Engine <-- Game Engine Impl --> Game Engine <-- Interaction Engine Impl --> Interaction Engine

With dependency inversion, the problem is much simpler to navigate, and forces the developer of the graphics engine and the interaction engine to conform to the same interfaces or both agree to changing them.

#### Mutable and Immutable Components

#### Event Sourcing

### SOLID Design Principles and their Architectural Implications

#### Single Responsibility Principle

A module should have one, and only one, reason to change. A 'module' is any cohesive set of functions and data structures. The code that different actors depend on should be separated.

For example, this app will have schema that correspond to responses to surveys. Some of the code written around the responses schema will allow users to view their survey responses. Other parts of the code will be responsible for performing k-means on coded data. Some of the code will summarize the data into human-readable text. Combined into one module, these methods would resemble this employee class:

![employee with all methods](/docs/pictures/srp%20employee%20with%20all%20methods.png)

These three sets of functions: read functionality for users, data analysis via k-means, and response summaries all have different responsibilities, and should therefore be separated into different modules, similar to this refactor of the employee class into a simple data structure and three extended classes that add methods.

![employee with split methods](/docs/pictures/srp%20employee%20split.png)

If one class representing survey responses with all the methods is needed, the separate modules can be recombined using the facade pattern:

![facade pattern](/docs/pictures/srp%20facade%20pattern.png)

#### The Open-Closed Principle

Software entities should be open for extension, but closed for modification.

![ocp split](/docs/pictures/ocp%20split.png)

Consider this picture of the structure of a financial data app, and imagine that the print presenter doesn't exist yet. How hard is it to add the print presenter? Not very hard, since, like the screen presenter, the print presenter only depends on the controller.

Why is the interactor dependent on nothing outside itself? It contains the business roles. Part of properly implementing the OCP in your architecture is to organize your modules hierarchically, based on how, why, and when they change, and then to organize that separated functionality into a hierarchy of components.

#### The Liskov Substitution Principle

Functions that use pointers or references to base classes must be able to use objects of derived classes without knowing it.

The Liskov Substitution Principle was defined in 1988 by Barbara Liskov as

> If for each object o1 of type S there is an object of type T such taht for all programs P defined in terms of T, the behavior of P is unchanged when o1 is substituted for o2 then S is a subtype of T.

Here is an example of an architecture that conforms to the LSP:
![lsp conformance](/docs/pictures/lsp%20conformance.png)

An interface doesn't have to be an interface; it could be a set of CRUD methods, a REST interface, or something else.

#### The Interface Segregation Principle

Clients should not be forced to depend upon interfaces they do not use.

Self explanatory; split up modules that contain more than they need to.

#### The Dependency Inversion Principle

Depend on abstractions, not concretes. The most flexible sstems are those in which source code dependencies refer only to abstractions, not to concretions.

- Don't refer to volatile concrete classes; refer to abstract interfaces instead
- Don't derive from volatile concrete classes
- Don't override concrete functions
- Never mention the name of anything concrete and volatile

How can you use concrete, volatile implementations without depending on them? The answe is to use the abstract factory pattern.
![abstract factory pattern](/docs/pictures/dip%20abstract%20factory%20use.png)
The curved line divides the abstract and concrete components of the system.

### Components and Component Cohesion

#### The Reuse/Release Equivalence Principle

Components must have release versions with supporting documentation, so that users can make informed decisions about which versions to use.

#### The Common Closure Principle

An extension of the SRP to components. A component should not have multiple reasons to change. To follow the CCP, classes that are likely to change for the same reasons should be bound up in the same components. Both the SRP and the CCP can be described by:

> Gather together those things that change at the same times and for the same reasons. Sepearate those things that change at different times or for different reasons.

#### The Common Reuse Principle

Another principle that helps to decide which classes and modules should be placed into a component. The CRP states that classes and modules that tend to be resued together belong in the same component.

### Architecture

#### The Goal: Keeping Options Open

How do you keep software 'soft'? In other words, how do you work to allow software to remain as flexible as possible for as long as possible. The answer is to defer the details that don't matter.

Software is composed of 'details' and 'policy'. Policy is the 'business rules and procedures', the core elements of the application. 'Details' include decisions like database, io devices, servers, web systems, etc. The more time spend developing high-level policy allows the important decisions around databases, interfaces, etc., to be made with more information and more testing capabilities.

#### Use Cases

A system must match its use cases; users shouldn't have to go digging through software to figure out how to use a system.

#### Operation

Operation is one of the details that should be delayed. Quality architecture should leave decisions about thread count, micro-services vs. single process, monolithic vs. just a few processes, to be decided later. An architecture that maintains proper isolation of component will create an easier decision on operation scheme.

#### Development

A system that must be developed by an organization with many teams and many concerns must have an architecture that facilitates independent actions by those teams, so that the teams do not interfeere with each other during development.

#### Deployment

Deploying should not require many configuration files with little tweaks, changes to file properties, extensive file relocation, or anything like that.

#### Decoupling Layers

The architect may not know what all the use cases or, what development will look like, etc.

Consider a shopping cart application. The developer might not know what stores might use the application, every feature the shopping cart application might need to support (such as sale prices on items), or generally, the specifics of use cases, operation, development, and deployment.

However, the developer can still start by isolating features of the application. The user interface can change for reasons that have nothing to do with the shopping cart. The database, query language, and schema are techincal details that have nothing to do with the business rules or the UI. They will change at rates, and for reasons, that are independent of other aspects of the system. Within the business rules, the validation of input fields is closely tied to the application, while counting inventory are less closely tied.

Here are a few basic layers revealed: the UI, application-specific business rules, application-independent business rules, and the database (not exhaustive).

#### Decoupling Use Cases

Use cases change for different reasons. Use cases are vertical and cut across horizontal architectures; for example, removing an order from a shopping cart cuts from the UI through specific and non-specific business rules, all the way to the database.

The application should also be decoupled according to use cases. Completing this vertical decoupling allows for creating new use cases without interfering with old ones.

Do not naively duplicate or reuse code. Consider the process of deleting an item from the shopping cart. The code might be very similar to adding an item to the shopping cart. In the database, the sql might be the same, except an 'insert' and 'values' is a 'delete'. However, just because the 'where' statements might match, the code is not really duplicated. What happens if an option is added to deleteAll? What may have been a simple boolean check in callee becomes a process of separating out the add from the remove logic and then the addition of the variable check. Before reusing, ask yourself if it really is a duplicate use-case.

#### Decoupling Modes

Uncle Bob suggests three levels of decoupling:

1. Source level. Within components, changes should cause recompilation; outside of components, changes should not cause recompilation.
1. Deployment level. Changes within executables or shared libraries should not force the redeployment of other executables and shared libraries. Here, many components still live in the same address space and communicate through function calls. Some components may live in a separate address space and communicate through interprocess communications, sockets, or shared memory.
1. Service level. Dependencies could be reduced to the level of datat structures, where communication is solely networked. This is a 'services and micro-services' type of deployment.

It's hard to know which mode is best during the early phases of a project, but the optimal mode may change over time. Decoupling at the service level by default doesn't necessarily make sense - it takes effort to ensure proper communication, which isn't cheap. Less decoupling may make sense - for example, for an app with 1000 users, why deploy different database tables separately?

Uncle Bob's suggested solution is to decouple to the point where a service could be formed. Leave components in the same address space as long as possible. This means that initially the components are separated at the source level - different folders contain different components. As issues arise, carefully choose which components to turn into services. If operational needs of the system decline, revert those choices.

### Which Lines Do You Draw, And When Do You Draw Them?

"You draw lines between things that matter and things that don't.... To draw boundary lines in a software architecture, you first parittion the system into components. Some of those components are core business rules; others are plugins that contain necessary functions that are not directly related to the core business. Then you arrange the code in those components such that the arrows between them point in onde direction--toward the core business".

#### The Database and Business Rules

Uncle Bob notes that this, importantly, includes between the business rules and the database. The business rules DO NOT depend on the database. They depend on a databse interface to save and load data, but they should not care about the implementation of this database.

![Database business rules split](/docs/pictures/drawing%20lines%20database%20business%20rules%20split.png)

The boundary line here is drawn between the database interface and the database access. The database knows about the business rules, but the business rules do not know about the database. The business rules can exist without the database, but the database can't exist without the business rules.

More directly, "The Database component contains the code that translates the calls made by the BusinessRules into the query language of the database. It is that translation code that knows about the business rules".

![Database business rules line split](/docs/pictures/drawing%20lines%20database%20business%20rules%20line%20split.png)

#### Input and Output

The GUI is not the system. The IO is irrelevant. This is true even for video games - the model of the state of the game is the business rules, whereas the physical display of a character

### Boundary Anatomy

#### Between Deployment Components

The simplest representation of an architectural boundary is a set of deployable units, which, at deployment time, are gathered together into a single directory or a WAR file, for eample. When deployed like this, they are a monolith. Communications across boundaries are very inexpensive, since they are just function calls, and can be very chatty.

#### Between Threads

Threads are not architectural boundaries or deployment units, but a way to organize the schedule of execution. They are generally contained within one or many components, and thus don't require cross-boundary communication.

#### Between Local Processes

Local processes are much stronger boundaries than components. Created from the command line or some sort of system call, they will communicate with other processes via sockets or shared memory (sockets are much more common now, I think; I haven't seen the use of shared memory except for in hardware).

The source code of higher-level processes must not contain the neames, or physical addresses, or registery lookup keys of lower-level processes - lower-level processes should be plugins to higher-level processes!

Communication between processes requires system calls, data conversion to a suitable format for transmission (data marshaling), and context switches, which, together, are moderately expensive.

#### Between Services

A service is the strongest boundary. A service is a process, independent of its location; two communicating services might operate on the same processor and network, but do not depend on doing so.

Communication across service boundaries is expensive as it requires ms of data travel time (latency).

### Using Policy to Decide Level

"Software systems are statement of policy". When a happens, what b should happen? How should c be calculated? Should d be formatted this way or this way?

> Part of the art of developing a software architecture is carefully separatig those policies from one another, and regrouping them based on the ways that they change. Policies that change for the same reasons, and at the same times, are at the same level and belong together in the same component. Policies that change for different reasons, or at different times, are at different levels and should be separated into different components.

Levels describe the distance between the component code and the inputs and outputs of the system.

![Using policies to decide level](/docs/pictures/using%20policies%20to%20decide%20level%20encryption%20program.png)

Read char reads from an input device, and write char writes to an output device. Translate is not dependent on the input or output device, so it is a level above the components responsible for interacting with i/o.

A clean architecture of this system would have two interfaces which create an upwards dependency.

![Proper architecture](/docs/pictures/using%20policies%20to%20decide%20level%20proper%20arch.png)

### What are business rules?

Business rules are the rules that are critical to the business, and would exist with or without the computer system.

Business rules go hand in hand with critical business data. Critical business data, similarly, would exist with or without the computer system.

Critical businesss rules and critical business data are tightly knit, so they should be bound into entities.

#### Entitites

An entity object contains the business data or has easy access to it and the business rules, which are methods that operate on the data.

![Critical business rules example](/docs/pictures/business%20rules%20entity%20example.png)

Entities implement critical concerns. They stand alone - they do not care about databases, user interfaces, or third-party frameworks.

For Eggbert, an excellent example of an entity is the survey. What would the Eggbert operation look like, if the surveys were done manually and results were hand collected and created? There would be surveys, which would contain many responses. You could operate upon the survey in ways such as tallying up the number of responses, finding the average sentiment, and so on.

#### Use Cases

Some business rules describe systems, rather than entities. For example, a computer sales company might require that a sale over $10000 requires a customer's full information, and therefore their sales website would not allow proceeding to the cart without customer information.

These business rules are _application-specific_ as opposed to _critical_, and Martin refers to them as use cases. A use case is a specification that travels from input to output. User stories are used as a way of describing use cases.

![Use case example](/docs/pictures/use%20case%20example.png)

Use cases do not describe UIs or databases, like critical business rules. However, they do describe the data that comes in through the UI and that is saved to the database.

> A use case is an object. It has one or more functions that implement the application-specific business rules. It alos has data elements that include the input data, the output data, and the references to the appropriate Entities with which it interacts.

Application-specific business rules depend on critical business rules. Entities have no knowledge of use cases; use cases depend on entities.

#### Request and Response Models

Even though use cases interact with data, they shouldn't know where the data is coming from. Use cases should accept request data structures and return response data structures.

However, request and response strucutres are NOT entities! Creating request and response interfaces which rely on entities would violate the Common Closure and Single Responsibility Principles. Requests and responses will change for differnt reasons than entities. For example, what a survey looks like will rarely change. Maybe demographics are added later. Requests and responses might change when status message are added, may contain format fields, might signal certain boolean conditions within the use case, etc.

### The Clean Architecture

#### What Existed?

1. Hexagonal Architecture / Pors and Adapters, developed by Alistair Cockburn, adopted by Steve Freeman and Nat Pryce in their _Growing Object Oriented Software with Tests_
1. DCI, developed by James Coplien and Tygve Reenskaug
1. BCE, developed by Ivar Jacobsen in _Object Oriented Software Engineering: A Use-Case Driven Approach_

All these architectures create a logical separation of concerns by dividing software into layers. In each system, software is:

1. Independent of frameworks. Frameworks should be tools, rather than constraints to fit into.
1. Testable. The business rules can be tested without external elements.
1. Independent of the UI. Web, console, desktop app, should be swappable.
1. Independent of the database. Your databse should be swappable.
1. Independent of any external agency. Your business rules shouldn't know about the outside world.

#### Binding These Principles

The clean architecture is a binding of these principles. Here is Robert's diagram:

![clean architecture circular](/docs/pictures/clean%20architecture%20circular.png)

#### Entities

Entities are the _critical business rules_. An entity can be an object with methods, it can be a set of data structures and functions, etc. It doesn't matter as long as the entities are usable by whatever depends on them.

#### Use Cases

Use Cases are the _application-specific business rules_. They orchestrate the flow of data to and from the entities. Changes in this layer do not affect the entities, and are not affected by frameworks, the UI, or the database.

#### Interface Adapters

Interface Adapters convert data from the format most convenient for the use cases and entities to the format most convenient for external agencies such as the database or the web.

For example, this layer will wholly contain the MVC architecture of a GUI. The controllers pass data to the use cases, and then back to the presenters and views.

This layer will have knowledge of the database. For example, if the database is an SQL database, the SQL will be located here.

#### Frameworks and Drivers

The outermost layer of the model is composed of tools such as the database and web frameworks.

These circles are arbitrary; they are a suggestion. The dependency rule, however, should always be followed. Dependencies should point inward.

#### Crossing Boundaries

The flow of control heads inward, then outward. The example in the above circular graph shows control flowing from the controller to the use cases, then back out to the presenter.

What happens when the control flows back out from the use case to the presenter, and the use case needs to call a function within the presenter? The use case has an output interface it depends on, which the presenter implements. This dynamic polymorphism solves issues where source dependencies should oppose the flow of control (as Robert Martin states many times).

#### How should data cross boundaries?

Only isolated, simple data structures are passed across the boundaries. Complicated structures like entities or database orws should not be passed; data structures should not create dependencies that violate the dependency rule.

Data structures that go across boundaries should be what is most convenient for the inner circle.

### Supporting Patterns

#### Presenters and Humble Objects

In the humble object pattern, objects are split into two: those that contain the behaviors that are hard to test, and those that contain the behaviors that are easy to test.

The humble object is hard to test. A good example of a humble object is a view: the exact layout of the gui according to the view specifications can required end-end testing, which is slow and requires additional frameworks and complicated set up.

The testable object is more complicated; a good example is that if dynamic fetching is done within a gui component, or a list is sorted, or data formatted, that behavior would occur in the presenter.

In the presenter/view pattern, the view is only passed enums, strings, and booleans.

The separation of architecture into testable and non-testable parts is a good boundary, as testing is always an attribute of good architectures.

Another example is the database gateways, which stand between the use case interactors and the database. These contain the methods for the CRUD operations required by the application. If the application needs to know the name of all users logged in yesterday, the `UserGateway` interface will have a method named `getLastNamesOfUsersWhoLoggedInAfter(date: Date): string[]`. The gateways are humble: they contain simple sql or whatever database interaction language is used. The use case interactors, however, are not humble: they contain aplication-specific business rules. Because they are not humble, they should be testable.

Humble objects can form boundaries across service interfaces. Service listeners are solely responsible for serializing data and passing it across a boundary.

[Here's an excellent article on implementing this pattern in react.](https://dev.to/krofdrakula/make-testable-components-using-the-humble-object-pattern-1j4o)

#### Partial Boundaries

1. Skip the Last Step
   Skipping the last step is treating components as completely separate right up until compile time, at which point all components are compiled together.

1. One-Dimensional Boundaries
   One-dimensional boundaries do not implement reciprocal boundary interfaces; they use interfaces only in one direction across boundaries.

   ![One-dimensional boundaries](/docs/pictures/partial%20boundaries%20one-dimensional.png)

1. Facades
   Facades compile the functions of lower-level classes and provide them as methods on a facade. In a facade, there is no dependency inversion. Higher-level classes have transitive dependencies on lower-level classes.

   ![Facades](/docs/pictures/partial%20boundares%20facades.png)

Partial boundaries should be used as a placeholder for an eventual full-fledge boundary. If a boundary never materializes, the partial boundaries can be cut down.

### The Main Component

The main component is the component that creates, coordinates, and oversees the other components (not necessarily called main).

The main creates the factories, strategies, etc., and then hand control over to higher-level parts of the system.

Dependency injection happens within the main component.

### Services: Great and Small

What is the difference between an architectural boundary (as Robert Martin defines it) and a service? Services do not necessarily separate low and high level policy by polymorphic obedience to higher level structures; they can just be function calls that don't rely on a well-defined API.

In the Uncle Bob world, functions calls are of two types: calls to functions which are responsible for separate behaviors, and architecturally-significant calls across component lines. Calls to services do not necessarily represent the second type.

Furthermore, services are coupled by the data structures which they use. Changes to fields result in changes to every service that is dependent on those data structures.

#### An Example: the Kitty Problem

Consider this taxi ordering app, where the boxes are independent teams responsible for independent services.

![Taxi app pic](/docs/pictures/services%20issues%20taxi%20suppliers.png)

What happens when the marketing teams announce that the app will now deliver kitties? People can buy kitties (I guess) from their smartphones, and the app will coordinate with the taxi companies to bring them the kitties.

Some of the taxis companies will decline to participate. Some drivers within the participating companies are allergic, and so they are unable to deliver kitties. Maybe kitties could be 'rentable', so they would need a scheduled return delivery. Perhaps customers who have cat allergies should know which taxis carried kitties recently; information which would need to be stored with the information about the taxis.

Attempting to implement this within the service-based system requires significant cross-team collaboration, since all the services would need to change to create the kitty service. Every software system must face the issues created by a significant overhaul, service-oriented or not.

#### Handling the Kitty Problem with SOLID Design Principles

Using SOLID design principles (remember, the [Single Responsibility Principle](#single-responsibility-principle), the [Open-Closed Principle](#the-open-closed-principle), the [Liskov Substitution Principle](#the-liskov-substitution-principle), the [Interface Segregation Principle](#the-interface-segregation-principle), and the [Dependency Inversion Principle](#the-dependency-inversion-principle)), the service-based architecture can be refactored to use abstract classes, specific methods of which are implemented by the kittens or the rides.

![services issues refactored](/docs/pictures/services%20issues%20refactored.png)

The rides and kittens classes implement methods in the abstract classes Taxi Finder, Taxi Selector, Taxi Suppliers, and Taxi Dispatcher. It is absolutely possible to implement this while retaining a service structure:

![service issues refactored as services](/docs/pictures/service%20issues%20refactored%20as%20services.png)

Cross-cutting concerns reveal that boundaries do not fall between services, but within them. To deal with cross-cutting concerns, services must be designed with internal component boudaries that follow the dependency rule (dependencies point upwards).

### The Test Boundary

Tests are the outermost circle of the architecture. They are the most isolated component, and nothing depends on them.

Tests will always be strongly coupled to the system. Small changes to components can cause hundreds, or thousands, of tests to break.

The solution is to design for testability. The first rule of software design, according to Robert Martin, is _don't depend on volatile things_.

#### The Testing API

The testing API allows the verification of the business rules. Tests should be able to avoid security constraints, bypass expensive resources such as databases, and force the system into testable states.

One of the purposes of the testing API is to decouple the tests and the structure of the application. Imagine that there is a test for every production class, and a set of test methods for every production methods. Changing a single class will require changing many tests.

The creation of a testing API allows for the structure of the application to be hidden. The production classes can evolve and refactor.

For security purposes, because of the privileged status of the testing suite, tests should be kept away from source code.

### Details

#### The Database is a Detail

The _way you choose to store your data_ is a detail. The data model itself is not. The database is a utility to persist data.

The relational database model was developed by Edgar Codd in 1970s, and implementations were dominant by the 1980s.

However, organizing data into rows within tables is not significant. It is a detail. Your software should not care that the data is in rows. There are significant differences between storage systems: databases are optimized for content-based access; file systems are optimized for name-based access.

Regardless, when the application loads the data into memory, it loads it in the form of linked-lists, hash maps, objects, arrays, and so on. It isn't organized by rows.

That's what makes the database a detail. Whether you read from a file-based system or a relational database, you transform the data into the form your software works with.

The performance of the database is separate from the performance of the business rules. It should and can still be analyzed and optimized, but that analysis occurs separately.

#### The Web is a Detail

The web has oscillated back and forth between performing processing on the client side or the server side. The business rules are separate from this continuing oscillations.

The GUI is a detail. The web is a GUI. So the web is a detail. There are many IO devices, and the web is one of them. In a web-based application, the boundary is going to be very chatty. The way a web app interacts with the browser will be very different from the way that a web app interacts with a desktop-based application. However, at some point, there will be use cases that consist of taking input, performing actions, and outputting data. Finding the boundaries is hard, but possible.

#### Frameworks are Details

Whenever you make a decision to use a framework, you make a huge commitment to that framework author, which the author does not make to you. Frameworks will provide objects, methods, and ways of doing things, which they will attempt to get you to integrate into your core entities and use cases.

Frameworks can help you get started faster and easier. However, easier startups can mean costs later, if the framework grows in a direction you don't want or aren't interested in, or if you outgrow the framework.

The solution is to avoid marrying the framework. Don't let it touch your business rules.

Your main component can know about frameworks, because it's dirty.

Some frameworks must be married. Standard libraries, compilers, and languages (in a sense), are all dependencies of your business rules. However, these choices should be made intentionally.

## Resources

Robert C. Martin, _Clean Architecture: A Craftsman's Guide to Software Structure and Design_

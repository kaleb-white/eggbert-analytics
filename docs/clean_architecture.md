# Clean Architecture

Clean architecture is a design philosophy that emphasizes a separation of concerns, decoupling, in order to create modular codebases.

![Clean architecture simple diagram](https://cdn-media-1.freecodecamp.org/images/YsN6twE3-4Q4OYpgxoModmx29I8zthQ3f0OR)

## Why Clean Architecture?

There are many design philosophies out there

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

## Implementing Clean Architecture in Eggbert

### Project File Structure

TODO

### Testing

TODO

## Resources

Robert C. Martin, _Clean Architecture: A Craftsman's Guide to Software Structure and Design_

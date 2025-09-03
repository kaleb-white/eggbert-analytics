# Clean Code

Clean code promotes the programmer's own understanding of the code they write, emphasizes working to keep code stateless and precise, and at its core, promotes communication through simplicity and elegance.

> The folks who think that code will one day disappear are like mathematicians who hope one day to discover a mathematics that does not have to be formal. They are hoping that one day we will discover a way to create machines that can do what we want rather than what we say. These machines will have to be able to understand us so well that they can translate vaguely specified needs into perfectly executing programs that precisely meet those needs.

-- Robert C. Martin, _Clean Code: A Handbook of Agile Software Craftsmanship,_ 2

This markdown document is a short summary of Robert C. Martin's recommendation's.

## Principles of Clean Code

### Meaningful Names

1. Use Intention-Revealing Names
   - Names should reveal intent. If a name needs a comment, it does not reveal intent.
   - An intentionless function:
   ```typescript
   function getItemFromList() {
     return listItems.map((li) => (li[0] === 4 ? li : null)).filter((li) => li);
   }
   ```
   - An intentional function:
   ```typescript
   function getFlaggedCells() {
     return gameCells
       .map((cell) => (cells[STATUS] === STATUSES.FLAGGED ? cell : null))
       .filter((cell) => cell);
   }
   ```
1. Avoid Disinformation
   - Avoid abbreviations that might be misinterpreted, spell similar concepts similarly, and avoid using type names in variables (more below).
1. _Make Meaningful Distinctions_
   - Avoid using variable names that are only differentiated by noise words, such as having `schemaInfo` and `schemaData`, `fileSize` and `fileLength`, or `customer` and `customerInfo`. Better names might be `schemaKeys` and `schemaValues`, `fileSizeMB` and `fileLengthChars`, and `partialCustomerAccount` and `fullCustomerAccount`.
1. Use Pronounceable names
   - Say that your database generates a date based on the date, year, month, day, hour, minute, and second. You might choose to call the variable `genymdhms`. Variable names like these are just hard to think about. A better idea would be `generationTimeStamp`.
1. _Use Searchable Names_
   - Replace magic numbers and strings with constants, which are easier to read and maintain. For example, maybe `7` should be `MAX_CLASSES_PER_STUDENT`.
   - For the same reason, longer names trump shorter names. Longer names are more likely to only appear in the desired places.
1. Avoid Encodings
   - Variable names no longer need to contain types in order to help the developer remember what type the variable is; suggestion algorithms like intelliSense or compiler warnings are more than capable.
1. Member Prefixes
   - Don't prefix class members with special strings.
1. Interfaces and Implementations
   - Interfaces should carry the name of the class, implementations should be named `InterfaceImpl`.
1. _Class Names_
   - "Classes and objects should have noun or noun phrase names like `Customer`, `WikiPage`, `Account`, and `AddressParser`. Avoid words like `Manager`, `Processor`, `Data`, or `Info` in the name of a class. A class name should not be a verb."
1. _Method Names_
   - "Methods should have verb or verb phrase names like `postPayment`, `deletePage`, or `save`. Accessors, mutators, and predicates should be named for their value and prefixed with `get`, `set`, and `is`."
1. _Pick One Word Per Concept_
   - Consider an abstract concept like 'this method will retrieve an object'. In your codebase, only use one of `fetch`, `retrieve`, or `get` to signal this concept.
   - Or, the concept, 'this class will control the view'. Only choose one of `controller`, `manager`, or `driver` for all view-controlling classes.
1. _Pick One Concept Per Word_
   - If `concat` is the choice for the abstract concept 'insert an item at the end of this list', use `add` when referring to 'insert an item into this unordered collection'.
1. Use Solution Domain Names or Problem Domain Names
   - This app is built with computer science for political science purposes. If, for example, a queue is used somewhere, that is within the solution domain. The queue pattern is implemented, so use `exampleQueue`.
   - However, for example, say data from the American National Election Studies survey is used. That is within the problem domain. A good name for a variable might be `nationalElectionStudiesAgeDemographics`, which, while not making much sense to a programmer, is coherent to a poliical scientist.

### Functions

1. Small
   - Functions should be small. If your function (minus blank lines) is > 20 lines, it needs to be refactored.
   - Blocks within `if`, `else`, and `while` statements should USUALLY be one line long, doing something such as calling a function.
1. Do One or Two Things
   - Note: this diverges from Robert C. Martin's guidelines slightly!
   - Consider the abstraction 'this function will send all the messages to the server'. There are two acceptable versions of an implementation of this abstraction, one which sends the messages to the server and communicates success or failure, and another which creates the messages, manually awaits the server's response, and then communicates success or failure:
   - Doing one thing:
   ```typescript
   function sendAllMessagesToServer(messages: messageImpl[]) {
     serverMessageResponses: messageResponsesImpl = [];
     for (const message of messages) {
       serverMessageResponses.concat(await sendMessageToServer(message));
     }
     return serverMessageResponses.hasError();
   }
   ```
   - Doing two things:
   ```typescript
   function sendAllMessagesToSever(messages: messageImpl[]) {
     serverMessageResponses: messageResponsesImpl = [];
     for (const message of messages) {
       let requestBody = createRequestBodyFromMessage(message);
       const serverResponse = await fetch("serverMessagePostApiEndpoint", {
         method: "POST",
         body: JSON.stringify(requestBody),
       });
       serverMessageResponses.concat(serverResponse);
     }
     return serverMessageResponses.hasError();
   }
   ```
   - It is acceptable to go one or two levels below the abstraction implied by the name of the function.
1. One Level of Abstraction per Function
   - Note: this is the section title from Martin's book. The term 'abstraction' is slightly overloaded, meaning both 'logical abstraction' - 'build a website' is more abstract than 'build a website using the client-server model' - and 'computational abstraction' - calling a function which returns an `HTMLDivElement` is more computationally abstract than calling a function that formats a string. In this section, Martin refers to computational abstraction; in the previous section, I was referring to logical abstraction.
   - Don't mix abstractions in a function. For example, consider a function which checks the statuses of some objects that have the fields statusMessage and header. Say the statusMessage field is a string that begins with 'info:', 'warn:', or 'error:'.
   - Incorrect:
   ```typescript
   function checkStatusOfSomeObjects(objects: someObject[]): string[] | Error {
     const objectStatusStrings = [];
     for (const object of objects) {
       if (object.statusMessage.startsWith("error:")) {
         return new Error(object.statusMessage.slice("error:".length));
       }
       if (object.statusMessage.startsWith("info:")) {
         objectStatusStrings.concat(object.statusMessage.slice("info:".length));
       }
       if (Object.keys(object.header).includes("error")) {
         return new Error(object.header.error);
       }
     }
     return objectStatusStrings;
   }
   ```
   - Correct:
   ```typescript
   function checkStatusOfSomeObjects(objects: someObject[]): string[] | Error {
     const objectStatusStrings = [];
     for (const object of objects) {
       const parseObjectResponse = parseObjectForErrorsOrStatus(object);
       if (parseObjectResponse instanceof Error) return response;
       objectStatusStrings.concat(parseObjectResponse);
     }
     return objectStatusString;
   }
   ```
1. Reading Code from Top to Bottom: _The Stepdown Rule_
   - Functions should be ordered from most to least logically AND computationally abstract within a file. For example, a react component that consists of a navbar, a set of objects, and pagination controls, should begin with the whole component, then the navbar, then the set of objects, then the pagination controls, then the buttons in the navbar, then the component that controls each object, then the buttons in the pagination controls.
1. Switch Statements
   - Switch statements should only be used in the context of creating polymorphic objects. For example, if employees can be of several different types, and each type implies a different pay, the switch statement should be hidden away within an abstract factory that creates a polymporphic employee object that knows its' pay.
   - Why?
     - Consider a switch on enum N. As values are added to N, the switch grows in length.
     - It does more than one, and often, more than two things.
     - It violates Martin's Single Responsbility Principle: a class should have only one reason to change. For example, consider the above `checkStatusOfSomeObjects`. It has only one reason to change: if the definition of `someObject` changes. [Check the wiki definitino for another example.]{https://en.wikipedia.org/wiki/Single-responsibility_principle#Example}
     - It violates Bertrand Meyer's Open-Closed Principle. The Open-Closed Principle states that functions should be open for extension but closed for modification. The switch statement will need to be modified every time that N changes. As long as `someObject` follows the OCP, `checkStatusOfSomeObjects` will not need to be modified if `someObject` is extended.

## Resources

Robert C. Martin, _Clean Code: A Handbook of Agile Software Craftsmanship_
https://medium.com/qest/uncle-bobs-clean-code-is-it-still-relevant-614c71d98748

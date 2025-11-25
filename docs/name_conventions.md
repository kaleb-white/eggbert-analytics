# Project Naming Conventions

## Extending this document!

If you see terms within the code that are not covered in here, add them! Creating naming conventions makes for much cleaner code.

## Terms

### Architecture

#### Controller

A grouped set of internal data pathways; for example, actions related to users are in the user controller, and actions related to crypto are in the crypto folder under controllers.

#### Use Case

A specific internal data pathway.

#### Gateway

An external interface which provides access to core functionality from the outside or an internal interface which provides access to external functionality from the inside.

#### Server Action

A react term for a function which exists on the server but is called from client components. Documentation [here](https://react.dev/reference/rsc/server-functions).

### People

#### respondent

The survey taker.

#### user

Anyone who uses the app.

#### anonymous

A respondent who has not signed in.

#### author

Someone who creates surveys.

#### role

A string which corresponds to a set of authorized actions.

### Surveys

#### survey

A survey.

#### question

A specific question which a survey seeks a respondent response to.

#### response

The encapsulated summary and data of the survey response. Survey responses correspond to a question. Survey responses contain transcript, as well as summaries, transcripts, demographics, etc.

#### dialogue

The conversation between the survey respondent and the model. Not an entity; a description of a transcript in progress.

#### dialogue context

A minimal subset of survey response which contains the necessary fields to communicate about a response with the model client proxy server.

#### transcript

The full dialogue text.

#### turns

Includes a question and survey respondent answer. Transcripts consist of turns.

#### messages

A model's question or a user's answer. Not an entity, a description.

#### respondent message

A respondent's message.

#### model message

A model's message.

#### model answer chunk

A streamed piece of a model's message.

#### prompt context

The context provided to a model when giving a user input.

#### demographics

Demographic information about a survey response.

### Auth

#### malicious

Input that is meant to hijack the server.

#### identifier

A group of means by which to identify an entity. For example, a user could be identified by their email.

### AI

#### model

To be consistent, use 'model' when referring to chatGPT, deepseek, or other generative ai models.

### DB (some just a reminder / definition)

#### generation

The creation of sql to save an object, fetch an object, create a view, etc.

#### execution

Interacting with the database to act on generated sql.

#### parameterized statement

A parameterized statement is a method of preventing SQL injection by first sending a query to the db with the SQL statement with some variable representing successive parameters, i.e. `client.query('INSERT INTO myTable (column1, column2) VALUES ($1, $2)', ['value1', 'value2'])` in node-postgres.

#### row

Use row when referring to a class, type, interface or object member which is stored within a row in the database.

#### aggregation

Use aggregation to refer to a collection of jsonb objects.

### Locations

#### directories

Use `dir` when referring to a folder or directory in code.

#### paths

Use `path` when referring to a path, route, or file location.

### Technical Terms

#### get

Use get when referring to creating an object from storage.

#### user actions

Actions related to changing the state of users within the application, such as signing in, signing up, etc.

## Casing conventions

### Files and folders

Name files and folders using snake case; for example use `my_folder` instead of `myFolder`.

### Variables and classes

Variables should use camelCase, ie., `myVariable`. Classes should follow the standard class naming, ie., `MyClass`.

Interfaces should be named according to the eventual name of the class. Implementations should end with `Impl`. For example,

```typescript
export interface MyClass {
    ...
}

export class MyClassImpl {
    ...
}
```

### CSS Variables

Name css variables using snake case with dashes to follow the Tailwind style, ie., `my-css-variable`.

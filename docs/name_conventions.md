# Project Naming Conventions

## Terms

### People

#### respondent

The survey taker.

#### user

Anyone who uses the app.

### Surveys

#### survey

A survey.

#### surveyResponse

The encapsulated summary and data of the surveyResponse. surveyResponses contain transcript, as well as summaries, transcripts, demographics, etc.

#### dialogue

The conversation between the survey respondent and the model. Not an entity; a description of a transcript in progress.

#### transcript

The full dialogue text.

#### turns

Includes a question and survey respondent answer. Transcripts consist of turns.

#### messages

A model's question or a user's answer. Not an entity, a description.

#### demographics

Demographic information about a survey response.

### AI

#### model

To be consistent, use 'model' when referring to chatGPT, deepseek, or other generative ai models.

### Locations

#### directories

Use `dir` when referring to a folder or directory in code.

#### paths

Use `path` when referring to a path, route, or file location.

## Casing conventions

### Files and folders

Name files and folders using snake case; for example use `my_folder` instead of `myFolder`.

### Variables and classes

Variables should use camelCase, ie., `myVariable`. Classes should follow the standard class naming, ie., `MyClass`.

Interfaces should end with `Interface`. Implementations should end with `Impl`. The dependency injector should export the chosen implementation with nothing appended. For example,

```typescript
export interface MyClassInterface {
    ...
}

export class MyClassImpl {
    ...
}

// dependency_injector.ts
export class MyClass
```

### CSS Variables

Name css variables using snake case with dashes to follow the Tailwind style, ie., `my-css-variable`.

# User Stories

## What are User Stories?

User stories are short sentences describing a user, what the user wants to do, and a brief description of why they want to do so.

> As Simon Survey Taker, I want to take a survey without navigating a sign up page, so that I don't become annoyed by the surveys and stop wanting to take them.

or,

> As Chance Survey Creator, I want to be able to create new prompts for my surveys, so that I can customize them after they are created.

(This naming scheme of userName userRole is arbitrary and just makes user stories a little more fun.)

User stories are intended to communicate requirements clearly in a non-technical manner that can be discussed by all parties.

## User Stories are User Centric

User stories allow for putting the user at the center of development, which can prevent over-engineering or even the addition of features that are neither required nor needed.

The user doesn't just have to be Simon Survey Taker or Chance Survey Creator. The user can also be Darryl Developer, Sarah Ann Server Admin, or anyone else that fits into an expansive, non-technical definition of 'user'.

## How do User Stories Fit into Workflows?

User stories are the smallest unit of work to be done. They might be grouped together into a sprint, a task, a story, an epic, or any other larger unit. Regardless, they are usually sorted by theme.

In eggbert, user stories will be issues on a github project board. If there is a need for greater organization of user stories, we will adress that issue as it comes.

## How do User Stories Enable Collaboration?

User stories cut layers vertically. For example, consider the second story example (which describes an addition, not something that shouldn't happen). What needs to happen to complete the user story?

1. A UI needs designed
2. Endpoints need created
3. Use cases need extended
4. Entities need new methods

Now, two developers could agree on the use case API for the endpoints to plug into within the use cases. Then, one developer begins on the UI and the endpoints, and another works on the use cases and entities.

Furthermore, breaking work down into small units can pump people up, since they are not too hard to implement!

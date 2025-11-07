export interface Model {
    /**
     * Only corresponds with the model, does not perform timeout checking or error checking.
     * @param context The promptContext, ie everything the model needs to know.
     * @param userInput The user's question
     */
    requestModelAnswerAsync(context: string, userInput: string): AsyncGenerator;
}

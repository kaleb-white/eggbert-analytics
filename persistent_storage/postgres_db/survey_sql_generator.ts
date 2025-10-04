import { Survey } from "@/core/entities/surveys/survey";
import { insertOrUpdateSurvey } from "./sql_generators_by_table/surveys";
import {
    insertOrUpdateOneManyRelationsOfSurvey,
    insertOrUpdateQuestionResponsesBySurvey,
    insertOrUpdateQuestionsBySurvey,
    insertOrUpdateResponsesBySurvey,
    insertOrUpdateTurnsBySurvey,
} from "./sql_generators_by_entity/survey";
import { OrderedParameterizedStatementsAndRawSQL } from "./generation_types_and_utilities";

export const surveySqlGenerator = {
    saveOrUpdateSurvey(
        survey: Survey
    ): OrderedParameterizedStatementsAndRawSQL {
        return [
            [
                insertOrUpdateTurnsBySurvey(survey),
                insertOrUpdateQuestionsBySurvey(survey),
                insertOrUpdateQuestionResponsesBySurvey(survey),
                insertOrUpdateResponsesBySurvey(survey),
                insertOrUpdateSurvey(survey),
            ],
            insertOrUpdateOneManyRelationsOfSurvey(survey),
        ];
    },
};

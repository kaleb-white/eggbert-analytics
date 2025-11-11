import { assignOrCreateUniqueId } from "@/utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../../controllers/crypto/interfaces/crypto_utility_creator";
import { Role } from "./user_roles";

export type SessionProps = {
    uniqueId?: string | CryptographyUtilities;
    antiCsrfToken?: string | CryptographyUtilities;
    userId: string;
    role: Role;
    expiration: number;
};

const msInThirtyDays: number = 2592000000;

const defaultProps: {
    uniqueId: string | CryptographyUtilities;
    antiCsrfToken: string | CryptographyUtilities;
    userId: string;
    role: Role;
    expiration: number;
} = {
    uniqueId: "",
    antiCsrfToken: "",
    userId: "",
    role: "anonymous",
    expiration: Date.now() + msInThirtyDays,
};

export class Session {
    uniqueId: string;
    antiCsrfToken: string;
    userId: string;
    role: Role;
    expiration: number;

    constructor(partialProps: SessionProps) {
        const props = partialProps ? partialProps : defaultProps;
        this.uniqueId = assignOrCreateUniqueId(
            props.uniqueId ? props.uniqueId : defaultProps.uniqueId
        );
        this.antiCsrfToken = assignOrCreateUniqueId(
            props.antiCsrfToken
                ? props.antiCsrfToken
                : defaultProps.antiCsrfToken
        );
        this.userId = props.userId ? props.userId : defaultProps.userId;
        this.role = props.role ? props.role : defaultProps.role;
        this.expiration = props.expiration
            ? props.expiration
            : defaultProps.expiration;
    }
}

import { assignOrCreateUniqueId } from "@/utilities/assign_or_create_uid";
import { CryptographyUtilities } from "../../controllers/crypto/interfaces/crypto_utility_creator";
import { Role } from "./user_roles";

export type UserProps = {
    uniqueId?: string | CryptographyUtilities;
    role?: Role;
    email?: string;
    timeCreated?: number;
    lastLogin?: number;
};

const defaultProps: {
    uniqueId: string;
    role: Role;
    email: string;
    timeCreated: number;
    lastLogin: number;
} = {
    uniqueId: "",
    role: "anonymous",
    email: "",
    timeCreated: Date.now(),
    lastLogin: Date.now(),
};

export class User {
    uniqueId: string;
    role: Role;
    email: string;
    timeCreated: number;
    lastLogin: number;

    constructor(partialProps?: UserProps) {
        const props = partialProps ? partialProps : defaultProps;
        this.uniqueId = assignOrCreateUniqueId(
            props.uniqueId ? props.uniqueId : defaultProps.uniqueId
        );
        this.role = props.role ? props.role : defaultProps.role;
        this.email = props.email ? props.email : defaultProps.email;
        this.timeCreated = props.timeCreated
            ? props.timeCreated
            : defaultProps.timeCreated;
        this.lastLogin = props.lastLogin
            ? props.lastLogin
            : defaultProps.lastLogin;
    }
}

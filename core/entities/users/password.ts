export type PasswordProps = {
    userId?: string;
    salt?: string;
    hash?: string;
};

const defaultProps: {
    userId: string;
    salt: string;
    hash: string;
} = {
    userId: "",
    salt: "",
    hash: "",
};

export class Password {
    userId: string;
    salt: string;
    hash: string;

    constructor(partialProps?: PasswordProps) {
        const props = partialProps ? partialProps : defaultProps;
        this.userId = props.userId ? props.userId : defaultProps.userId;
        this.salt = props.salt ? props.salt : defaultProps.salt;
        this.hash = props.hash ? props.hash : defaultProps.hash;
    }
}

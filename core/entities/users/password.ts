export type PasswordProps = {
    userId?: string;
    hash?: string;
};

const defaultProps: {
    userId: string;
    hash: string;
} = {
    userId: "",
    hash: "",
};

export class Password {
    userId: string;
    hash: string;

    constructor(partialProps?: PasswordProps) {
        const props = partialProps ? partialProps : defaultProps;
        this.userId = props.userId ? props.userId : defaultProps.userId;
        this.hash = props.hash ? props.hash : defaultProps.hash;
    }
}

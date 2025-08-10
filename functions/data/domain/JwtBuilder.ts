export interface IJwtBuilder {
  encrypt: (value: string | object, expiresIn?: number) => string;
  decrypt: (value: string) => string | object | null;
}

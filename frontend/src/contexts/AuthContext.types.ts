export interface signInTypes {
  login: string;
  password: string;
}

export type AuthContextType = {
  signIn: (
    data: signInTypes,
    loginSetLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => Promise<boolean>;
  signOut: () => void;
};

import { HomeContext } from "./context"
import { HomeControllerProps } from "./types"
export const HomeController = (props: HomeControllerProps): JSX.Element => {
    const state = {}
    return (
        <HomeContext.Provider value={state}>
            {props.children}
        </HomeContext.Provider>
    )
}
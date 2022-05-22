import { HomeController } from "./controller"
import { HomeProps } from "./types"
import { HomeView } from "./view"
export const Home = (props: HomeProps): JSX.Element => {
    return (
        <HomeController {...props}>
            <HomeView {...props} />
        </HomeController>
    )
}
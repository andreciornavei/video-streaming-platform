import { Grid } from '@mui/material';
import Box from '@mui/material/Box/Box';
import Container from '@mui/material/Container/Container';
import Typography from '@mui/material/Typography/Typography';
import { HeaderAppBar } from '../../components/header-app-bar';
import MovieCard from '../../components/movie-card';
import { VideoPlayer } from '../../components/video-player';

export const HomeView = (): JSX.Element => {
    return (
        <>
            <HeaderAppBar />
            <Container>
                <Typography variant="caption" component="div" fontSize={21} mt={2} mb={2}>
                    Beatles - Hey Jude
                </Typography>
                <Box>
                    <Grid container>
                        <Grid item xs={12}>
                            <VideoPlayer />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3} mt={2}>
                        <Grid item xs={6} sm={4} md={3}>
                            <MovieCard />
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                            <MovieCard />
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                            <MovieCard />
                        </Grid>
                        <Grid item xs={6} sm={4} md={3}>
                            <MovieCard />
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </>
    )
}
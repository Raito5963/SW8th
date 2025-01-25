import {
    Button,
    Container,
    Typography,
    Paper,
    Link,
    Box,
} from "@mui/material";
import Search from "./_components/Search";

export default function Home() {
    return (
        <Container>
            <Box>
                <Link href="/login" underline="none">
                    ログイン
                </Link>
            </Box>
            <Search />
            <Box>
                <Link href="/threads/create" underline="none">
                    新規スレッド・投稿
                </Link>
                <a> | </a>
                <Link href="/threads" underline="none">
                    スレッド一覧
                </Link>
            </Box>
            <Box>
                <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                    <Typography variant="h4">新着ブログ</Typography>
                    <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                        //新着順に横スクロール
                    </Paper>
                </Paper>
            </Box>
            <Box>
                <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                    <Typography variant="h4">最近入室したスレッド</Typography>
                    <Paper elevation={3} style={{ padding: "1rem", marginTop: "1rem" }}>
                        //新着順に横スクロール
                    </Paper>
                </Paper>
            </Box>
        </Container>
    );
}

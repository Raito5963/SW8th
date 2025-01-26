import { Container, Typography, Box, Button, Link, Divider } from '@mui/material';

export default function Usage() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        gaga friends の使い方
      </Typography>
      
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          1. ログイン
        </Typography>
        <Typography variant="body1">
          サイトにアクセスすると、画面上部に「ログイン」ボタンが表示されます。クリックすると、ログイン画面が表示されます。
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          2. 掲示板
        </Typography>
        <Typography variant="body1">
          <strong>スレッド一覧</strong>: 画面上部の「スレッド一覧」リンクをクリックすると、既存のスレッドの一覧が表示されます。各スレッドをクリックして内容を閲覧できます。
        </Typography>
        <Typography variant="body1">
          <strong>新規スレッド・投稿</strong>: 画面上部の「新規スレッド・投稿」リンクをクリックすると、新しいスレッドを作成できます。タイトルと内容を入力し、「投稿」ボタンを押すと、スレッドが作成されます。
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          3. ブログ
        </Typography>
        <Typography variant="body1">
          <strong>ブログ一覧</strong>: 画面上部の「ブログ一覧」リンクをクリックすると、既存のブログ記事の一覧が表示されます。各記事をクリックして内容を閲覧できます。
        </Typography>
        <Typography variant="body1">
          <strong>新規ブログ・投稿</strong>: 画面上部の「新規ブログ・投稿」リンクをクリックすると、新しいブログ記事を作成できます。タイトルと内容を入力し、「投稿」ボタンを押すと、記事が公開されます。
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          4. 検索
        </Typography>
        <Typography variant="body1">
          画面上部の「検索」バーを使用して、掲示板やブログ内のコンテンツを検索できます。キーワードを入力し、関連するスレッドや記事を見つけてください。
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          5. その他
        </Typography>
        <Typography variant="body1">
          画面上部に「新着ブログ」や「最近入室したスレッド」のセクションがあります。これらのセクションでは、新しく投稿されたブログ記事や最近閲覧されたスレッドを確認できます。
        </Typography>

        <Box mt={4}>
          <Button variant="contained" color="primary" component={Link} href="/">
            ホームに戻る
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

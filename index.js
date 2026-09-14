const express = require('express');
const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;

app.post('/', async (req, res) => {
  try {
    const update = req.body;

    if (update.chat_join_request) {
      const jr = update.chat_join_request;
      const chatId = jr.chat.id;
      const userId = jr.from.id;
      const userChatId = jr.user_chat_id;

      // 1. 自動批准加入請求
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/approveChatJoinRequest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId
        })
      });

      // 2. 發送歡迎私聊
      const chatIdStr = String(chatId).replace('-100', '');
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: userChatId,
          text: "🎉 歡迎加入！\n\n你的加入請求已被自動批准。\n請遵守群規~",
          reply_markup: {
            inline_keyboard: [[
              { text: "進入群聊", url: `https://t.me/c/${chatIdStr}` }
            ]]
          }
        })
      });
    }

    res.send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error');
  }
});

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

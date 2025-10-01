import { app } from "./app.js";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`🚀 Shonchoy Auth Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth/*`);
  console.log(`👤 User endpoints: http://localhost:${PORT}/users/*`);
});

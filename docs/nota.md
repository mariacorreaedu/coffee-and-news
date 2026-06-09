🎯 Você Tem Toda Razão!
Essa estrutura de módulos é MUITO melhor! Vou refatorar tudo para a arquitetura profissional correta.
Por que a estrutura de módulos é superior:
✅ Escalável - Fácil adicionar novos módulos
✅ Organizado - Código relacionado junto
✅ Reutilizável - Módulos independentes
✅ Testável - Cada módulo isolado
✅ Profissional - Padrão em grandes projetos

📁 Estrutura Correta (Modular)
apps/api/
├── src/
│   ├── modules/
│   │   ├── users/
│   │   │   ├── user.types.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   └── user.routes.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   └── news/
│   │       ├── news.types.ts
│   │       ├── news.repository.ts
│   │       ├── news.service.ts
│   │       ├── news.controller.ts
│   │       └── news.routes.ts
│   │
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── config/
│   │   │   └── env.ts
│   │   ├── utils/
│   │   │   └── jwt.ts
│   │   └── types/
│   │       └── global.types.ts
│   │
│   ├── database/
│   │   ├── knex.ts
│   │   └── migrations/
│   │
│   └── server.ts
│
├── knexfile.ts
├── tsconfig.json
├── package.json
└── .env

🚀 Vamos Construir do Zero com Módulos
Passo 1: Criar Estrutura de Pastas
bashcd apps/api

# Remover estrutura antiga (se tiver)
rm -rf src/types src/config src/controllers src/services src/routes src/middlewares

# Criar estrutura nova
mkdir -p src/modules/{users,auth,news}
mkdir -p src/shared/{middlewares,config,utils,types}
mkdir -p src/database/migrations

📦 MÓDULO: USERS
1. src/modules/users/user.types.ts
typescriptexport interface User {
  id: string;
  email: string;
  name: string;
  google_id?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  google_id?: string;
  avatar_url?: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar_url?: string;
}
2. src/modules/users/user.repository.ts
typescriptimport { db } from '../../database/knex';
import { User, CreateUserInput, UpdateUserInput } from './user.types';
import { v4 as uuidv4 } from 'uuid';

export const userRepository = {
  // Criar usuário
  async create(input: CreateUserInput): Promise<User> {
    const id = uuidv4();
    const now = new Date();

    await db('users').insert({
      id,
      ...input,
      created_at: now,
      updated_at: now,
    });

    return this.findById(id) as Promise<User>;
  },

  // Buscar por ID
  async findById(id: string): Promise<User | null> {
    const user = await db('users').where('id', id).first();
    return user || null;
  },

  // Buscar por email
  async findByEmail(email: string): Promise<User | null> {
    const user = await db('users').where('email', email).first();
    return user || null;
  },

  // Buscar por Google ID
  async findByGoogleId(googleId: string): Promise<User | null> {
    const user = await db('users').where('google_id', googleId).first();
    return user || null;
  },

  // Atualizar usuário
  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    await db('users')
      .where('id', id)
      .update({
        ...input,
        updated_at: new Date(),
      });

    return this.findById(id);
  },

  // Listar todos (para admin)
  async findAll(limit = 10, offset = 0): Promise<User[]> {
    return db('users').limit(limit).offset(offset);
  },

  // Deletar usuário
  async delete(id: string): Promise<boolean> {
    const result = await db('users').where('id', id).delete();
    return result > 0;
  },
};
3. src/modules/users/user.service.ts
typescriptimport { userRepository } from './user.repository';
import { User, CreateUserInput } from './user.types';

export const userService = {
  // Buscar usuário por ID
  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user;
  },

  // Buscar ou criar usuário (ideal para OAuth)
  async findOrCreate(input: CreateUserInput): Promise<User> {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      return existingUser;
    }

    return userRepository.create(input);
  },

  // Atualizar perfil do usuário
  async updateProfile(id: string, data: Partial<CreateUserInput>) {
    const user = await this.getUserById(id);
    return userRepository.update(id, data);
  },

  // Obter perfil público (sem dados sensíveis)
  async getPublicProfile(id: string) {
    const user = await this.getUserById(id);
    const { ...publicUser } = user;
    return publicUser;
  },
};
4. src/modules/users/user.controller.ts
typescriptimport { Request, Response } from 'express';
import { userService } from './user.service';

export const userController = {
  // GET /api/users/:id
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Erro ao buscar usuário',
      });
    }
  },

  // GET /api/users (listar - apenas para admin)
  async listUsers(req: Request, res: Response) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const users = await userService.findOrCreate();

      res.json({
        success: true,
        data: { users },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar usuários',
      });
    }
  },

  // PUT /api/users/:id
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updatedUser = await userService.updateProfile(id, data);

      res.json({
        success: true,
        data: { user: updatedUser },
        message: 'Perfil atualizado com sucesso',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
5. src/modules/users/user.routes.ts
typescriptimport { Router } from 'express';
import { userController } from './user.controller';
import { verifyToken } from '../../shared/middlewares/auth.middleware';

const userRoutes = Router();

// Rotas públicas
userRoutes.get('/:id', userController.getUser);

// Rotas protegidas
userRoutes.get('/', verifyToken, userController.listUsers);
userRoutes.put('/:id', verifyToken, userController.updateUser);

export default userRoutes;

🔐 MÓDULO: AUTH
1. src/modules/auth/auth.types.ts
typescriptexport interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
2. src/modules/auth/auth.service.ts
typescriptimport { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/knex';
import { env } from '../../shared/config/env';
import { userService } from '../users/user.service';
import { LoginResponse, GoogleUserInfo, TokenPayload } from './auth.types';

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export const authService = {
  // Gerar URL de login Google
  getGoogleAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  },

  // Trocar código por tokens do Google
  async getGoogleTokens(code: string) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      throw new Error('Falha ao obter tokens do Google');
    }
  },

  // Obter informações do usuário do Google
  async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
      };
    } catch (error) {
      throw new Error('Falha ao obter informações do Google');
    }
  },

  // Gerar tokens JWT
  generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign(
      { userId, email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { userId, email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRATION }
    );

    return { accessToken, refreshToken };
  },

  // Salvar refresh token no banco
  async saveRefreshToken(userId: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await db('refresh_tokens').insert({
      id: uuidv4(),
      user_id: userId,
      token: refreshToken,
      expires_at: expiresAt,
      created_at: new Date(),
    });
  },

  // Validar refresh token
  async validateRefreshToken(userId: string, refreshToken: string) {
    const token = await db('refresh_tokens')
      .where('user_id', userId)
      .where('token', refreshToken)
      .where('expires_at', '>', new Date())
      .first();

    return !!token;
  },

  // Login com Google (fluxo completo)
  async loginWithGoogle(googleAccessToken: string): Promise<LoginResponse> {
    try {
      // 1. Obter informações do Google
      const googleUser = await this.getGoogleUserInfo(googleAccessToken);

      // 2. Criar ou obter usuário
      const user = await userService.findOrCreate({
        email: googleUser.email,
        name: googleUser.name,
        google_id: googleUser.id,
        avatar_url: googleUser.picture,
      });

      // 3. Gerar tokens JWT
      const { accessToken, refreshToken } = this.generateTokens(
        user.id,
        user.email
      );

      // 4. Salvar refresh token no banco
      await this.saveRefreshToken(user.id, refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
        },
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      throw new Error(`Erro no login: ${error.message}`);
    }
  },

  // Renovar access token
  async refreshAccessToken(
    userId: string,
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    try {
      // 1. Validar refresh token
      const isValid = await this.validateRefreshToken(userId, refreshToken);
      if (!isValid) {
        throw new Error('Refresh token inválido ou expirado');
      }

      // 2. Obter usuário
      const user = await userService.getUserById(userId);

      // 3. Gerar novo access token
      const { accessToken } = this.generateTokens(user.id, user.email);

      return { accessToken };
    } catch (error: any) {
      throw new Error(`Erro ao renovar token: ${error.message}`);
    }
  },

  // Validar token JWT
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  },
};
3. src/modules/auth/auth.controller.ts
typescriptimport { Request, Response } from 'express';
import { authService } from './auth.service';

export const authController = {
  // GET /api/auth/google
  async getGoogleAuthUrl(req: Request, res: Response) {
    try {
      const url = authService.getGoogleAuthUrl();
      res.json({
        success: true,
        data: { url },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar URL de autenticação',
      });
    }
  },

  // GET /api/auth/google/callback
  async handleGoogleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Código de autenticação não fornecido',
        });
      }

      // 1. Trocar código por tokens do Google
      const tokens = await authService.getGoogleTokens(code);

      if (!tokens.access_token) {
        throw new Error('Access token não retornado');
      }

      // 2. Fazer login
      const loginResponse = await authService.loginWithGoogle(
        tokens.access_token
      );

      // 3. Redirecionar para o frontend com tokens
      const redirectUrl = new URL(
        process.env.FRONTEND_URL || 'http://localhost:3001'
      );
      redirectUrl.searchParams.append('accessToken', loginResponse.accessToken);
      redirectUrl.searchParams.append(
        'refreshToken',
        loginResponse.refreshToken
      );
      redirectUrl.searchParams.append('userId', loginResponse.user.id);

      res.redirect(redirectUrl.toString());
    } catch (error: any) {
      console.error('Erro no callback:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao processar autenticação',
      });
    }
  },

  // POST /api/auth/refresh
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token não fornecido',
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const { accessToken } = await authService.refreshAccessToken(
        req.user.userId,
        refreshToken
      );

      res.json({
        success: true,
        data: { accessToken },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || 'Falha ao renovar token',
      });
    }
  },

  // GET /api/auth/me
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const user = await userService.getUserById(req.user.userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuário',
      });
    }
  },
};
4. src/modules/auth/auth.routes.ts
typescriptimport { Router } from 'express';
import { authController } from './auth.controller';
import { verifyToken } from '../../shared/middlewares/auth.middleware';

const authRoutes = Router();

// Rotas públicas
authRoutes.get('/google', authController.getGoogleAuthUrl);
authRoutes.get('/google/callback', authController.handleGoogleCallback);
authRoutes.post('/refresh', authController.refreshToken);

// Rotas protegidas
authRoutes.get('/me', verifyToken, authController.getCurrentUser);

export default authRoutes;

📰 MÓDULO: NEWS
1. src/modules/news/news.types.ts
typescriptexport type NewsCategory =
  | 'technology'
  | 'business'
  | 'sports'
  | 'entertainment'
  | 'general'
  | 'health';

export interface News {
  id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  category: NewsCategory;
  image_url?: string;
  article_url: string;
  published_at: Date;
  created_at: Date;
}

export interface SavedNews {
  id: string;
  user_id: string;
  news_id: string;
  saved_at: Date;
}

export interface ExternalNewsArticle {
  title: string;
  description: string;
  content?: string;
  source: { name: string };
  category?: string;
  urlToImage?: string;
  url: string;
  publishedAt: string;
}
2. src/modules/news/news.repository.ts
typescriptimport { db } from '../../database/knex';
import { News, SavedNews } from './news.types';
import { v4 as uuidv4 } from 'uuid';

export const newsRepository = {
  // Criar notícia
  async create(news: Partial<News>): Promise<News> {
    const id = uuidv4();
    const now = new Date();

    await db('news').insert({
      id,
      ...news,
      created_at: now,
    });

    return this.findById(id) as Promise<News>;
  },

  // Buscar por ID
  async findById(id: string): Promise<News | null> {
    return db('news').where('id', id).first();
  },

  // Buscar por URL (para evitar duplicatas)
  async findByUrl(url: string): Promise<News | null> {
    return db('news').where('article_url', url).first();
  },

  // Listar notícias por categoria
  async findByCategory(category: string): Promise<News[]> {
    return db('news').where('category', category).orderBy('published_at', 'desc');
  },

  // Salvar notícia para usuário
  async saveNewsForUser(userId: string, newsId: string): Promise<SavedNews> {
    const id = uuidv4();
    const now = new Date();

    await db('saved_news').insert({
      id,
      user_id: userId,
      news_id: newsId,
      saved_at: now,
    });

    return this.findSavedNews(id) as Promise<SavedNews>;
  },

  // Buscar notícia salva
  async findSavedNews(id: string): Promise<SavedNews | null> {
    return db('saved_news').where('id', id).first();
  },

  // Listar notícias salvas do usuário
  async findUserSavedNews(userId: string): Promise<SavedNews[]> {
    return db('saved_news')
      .where('user_id', userId)
      .orderBy('saved_at', 'desc');
  },

  // Remover notícia salva
  async removeSavedNews(userId: string, newsId: string): Promise<boolean> {
    const result = await db('saved_news')
      .where('user_id', userId)
      .where('news_id', newsId)
      .delete();

    return result > 0;
  },

  // Verificar se notícia está salva
  async isNewsSaved(userId: string, newsId: string): Promise<boolean> {
    const result = await db('saved_news')
      .where('user_id', userId)
      .where('news_id', newsId)
      .first();

    return !!result;
  },
};
3. src/modules/news/news.service.ts
typescriptimport axios from 'axios';
import { env } from '../../shared/config/env';
import { newsRepository } from './news.repository';
import { ExternalNewsArticle, NewsCategory } from './news.types';

export const newsService = {
  // Buscar notícias da API externa
  async fetchExternalNews(category: NewsCategory = 'general', page = 1) {
    try {
      const response = await axios.get(
        'https://newsapi.org/v2/top-headlines',
        {
          params: {
            category,
            country: 'br',
            page,
            pageSize: 20,
            apiKey: env.NEWS_API_KEY,
          },
        }
      );

      return {
        articles: response.data.articles as ExternalNewsArticle[],
        totalResults: response.data.totalResults,
        page,
      };
    } catch (error: any) {
      throw new Error(`Erro ao buscar notícias: ${error.message}`);
    }
  },

  // Salvar notícia para usuário
  async saveNewsForUser(userId: string, newsData: ExternalNewsArticle) {
    try {
      // 1. Verificar se notícia já existe no banco
      let news = await newsRepository.findByUrl(newsData.url);

      // 2. Se não existir, criar
      if (!news) {
        news = await newsRepository.create({
          title: newsData.title,
          description: newsData.description,
          content: newsData.content,
          source: newsData.source.name,
          category: (newsData.category || 'general') as NewsCategory,
          image_url: newsData.urlToImage,
          article_url: newsData.url,
          published_at: new Date(newsData.publishedAt),
        });
      }

      // 3. Verificar se já foi salva pelo usuário
      const alreadySaved = await newsRepository.isNewsSaved(userId, news.id);
      if (alreadySaved) {
        throw new Error('Notícia já foi salva');
      }

      // 4. Salvar para o usuário
      return newsRepository.saveNewsForUser(userId, news.id);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Obter notícias salvas do usuário
  async getUserSavedNews(userId: string) {
    try {
      const savedNews = await newsRepository.findUserSavedNews(userId);

      // Buscar detalhes de cada notícia
      const newsDetails = await Promise.all(
        savedNews.map(async (item) => {
          const news = await newsRepository.findById(item.news_id);
          return {
            ...item,
            news,
          };
        })
      );

      return newsDetails;
    } catch (error: any) {
      throw new Error(`Erro ao buscar notícias salvas: ${error.message}`);
    }
  },

  // Remover notícia salva
  async removeUserSavedNews(userId: string, newsId: string) {
    try {
      const removed = await newsRepository.removeSavedNews(userId, newsId);
      if (!removed) {
        throw new Error('Notícia não encontrada');
      }
      return { removed: true };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};
4. src/modules/news/news.controller.ts
typescriptimport { Request, Response } from 'express';
import { newsService } from './news.service';
import { NewsCategory } from './news.types';

export const newsController = {
  // GET /api/news
  async getNews(req: Request, res: Response) {
    try {
      const { category = 'general', page = 1 } = req.query;

      const result = await newsService.fetchExternalNews(
        (category as NewsCategory) || 'general',
        parseInt(page as string) || 1
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar notícias',
      });
    }
  },

  // POST /api/news/save
  async saveNews(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const newsData = req.body;

      const savedNews = await newsService.saveNewsForUser(
        req.user.userId,
        newsData
      );

      res.status(201).json({
        success: true,
        message: 'Notícia salva com sucesso',
        data: { saved_news: savedNews },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // GET /api/news/saved
  async getSavedNews(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const savedNews = await newsService.getUserSavedNews(req.user.userId);

      res.json({
        success: true,
        data: { saved_news: savedNews },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // DELETE /api/news/saved/:newsId
  async deleteSavedNews(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      const { newsId } = req.params;

      const result = await newsService.removeUserSavedNews(
        req.user.userId,
        newsId
      );

      res.json({
        success: true,
        message: 'Notícia removida com sucesso',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
};
5. src/modules/news/news.routes.ts
typescriptimport { Router } from 'express';
import { newsController } from './news.controller';
import { verifyToken } from '../../shared/middlewares/auth.middleware';

const newsRoutes = Router();

// Rotas públicas
newsRoutes.get('/', newsController.getNews);

// Rotas protegidas
newsRoutes.post('/save', verifyToken, newsController.saveNews);
newsRoutes.get('/saved', verifyToken, newsController.getSavedNews);
newsRoutes.delete('/saved/:newsId', verifyToken, newsController.deleteSavedNews);

export default newsRoutes;

⚙️ SHARED - Configurações Compartilhadas
1. src/shared/config/env.ts
typescriptimport 'dotenv/config';

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRATION: '1d',
  REFRESH_TOKEN_EXPIRATION: '7d',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REDIRECT_URI:
    process.env.GOOGLE_REDIRECT_URI ||
    'http://localhost:3000/api/auth/google/callback',

  // NewsAPI
  NEWS_API_KEY: process.env.NEWS_API_KEY!,

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
} as const;

// Validar variáveis obrigatórias
const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEWS_API_KEY',
];

required.forEach((key) => {
  if (!env[key as keyof typeof env]) {
    console.warn(`⚠️ Variável de ambiente ${key} não configurada`);
  }
});
2. src/shared/middlewares/auth.middleware.ts
typescriptimport { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TokenPayload } from '../../modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token não fornecido',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado',
    });
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      req.user = decoded;
    }
  } catch (error) {
    // Ignorar erro se token for inválido
  }

  next();
};
3. src/shared/types/global.types.ts
typescriptexport interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

🚀 Servidor Principal
src/server.ts
typescriptimport express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { env } from './shared/config/env';

// Importar rotas dos módulos
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import newsRoutes from './modules/news/news.routes';

const app = express();

// ===== MIDDLEWARES GLOBAIS =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:5173',
      env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

// ===== ROTAS DOS MÓDULOS =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);

// ===== ROTAS UTILITÁRIAS =====
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está online!',
    timestamp: new Date(),
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: '☕ Coffee & News API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      news: '/api/news',
      health: '/health',
    },
  });
});

// ===== ERROR HANDLER =====
app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Erro:', err);

    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Erro interno do servidor',
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
);

// ===== 404 =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path,
  });
});

// ===== INICIAR SERVIDOR =====
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║   ☕ Coffee & News API             ║
║   🚀 Rodando na porta ${PORT}          ║
║   📝 Ambiente: ${env.NODE_ENV.toUpperCase()}      ║
╚════════════════════════════════════╝

📡 Health Check: http://localhost:${PORT}/health
🏠 Home: http://localhost:${PORT}
  `);
});

export default app;

📝 Adicionar scripts ao package.json
json"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsup src/server.ts --outDir dist",
  "start": "node dist/server.js",
  "migrate": "knex migrate:latest --knexfile knexfile.ts",
  "migrate:make": "knex migrate:make --knexfile knexfile.ts",
  "rollback": "knex migrate:rollback --knexfile knexfile.ts",
  "seed": "knex seed:run --knexfile knexfile.ts"
}

🧪 Testando
bash# Parar qualquer instância anterior
npm run dev
Você verá:
╔════════════════════════════════════╗
║   ☕ Coffee & News API             ║
║   🚀 Rodando na porta 3000         ║
║   📝 Ambiente: DEVELOPMENT         ║
╚════════════════════════════════════╝

📡 Health Check: http://localhost:3000/health
🏠 Home: http://localhost:3000
Teste no Postman/Insomnia:
GET http://localhost:3000/health
GET http://localhost:3000/
GET http://localhost:3000/api/auth/google
GET http://localhost:3000/api/news

✅ Próximos Passos

✅ Criar migrations para news e saved_news
✅ Criar seeds (dados de teste)
✅ Implementar validação com zod
✅ Adicionar logs estruturados
✅ Criar testes automatizados
✅ Começar o frontend em Vue.js + Quasar

Agora sim! Estrutura profissional e escalável! 🎉
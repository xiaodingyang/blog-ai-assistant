import { Request, Response, NextFunction, Router } from 'express';
import { AiAssistantService } from './service';
import { ServiceConfig, AskArticleRequest, AskGeneralRequest } from './types';

/**
 * 创建 AI 助手路由
 * @param config 服务配置
 * @returns Express Router
 */
export function createAiAssistantRouter(config: ServiceConfig): Router {
  const router = Router();
  const service = new AiAssistantService(config);
  const maxQuestionLength = config.maxQuestionLength || 800;

  /**
   * POST /ask - 文章问答
   */
  router.post('/ask', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { articleId, question, scope, categoryAssist } = req.body as AskArticleRequest;

      // 参数验证
      if (!articleId || typeof articleId !== 'string') {
        return res.status(400).json({
          code: 400,
          message: 'articleId is required',
        });
      }

      if (!question || typeof question !== 'string') {
        return res.status(400).json({
          code: 400,
          message: 'question is required',
        });
      }

      const q = question.trim();
      if (q.length < 2) {
        return res.status(400).json({
          code: 400,
          message: 'Question is too short',
        });
      }

      if (q.length > maxQuestionLength) {
        return res.status(400).json({
          code: 400,
          message: `Question length cannot exceed ${maxQuestionLength} characters`,
        });
      }

      // 调用服务
      const data = await service.askArticle({
        articleId,
        question: q,
        scope,
        categoryAssist,
      });

      res.json({
        code: 0,
        data,
      });
    } catch (err: any) {
      next(err);
    }
  });

  /**
   * POST /chat - 全站通用问答
   */
  router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question } = req.body as AskGeneralRequest;

      // 参数验证
      if (!question || typeof question !== 'string') {
        return res.status(400).json({
          code: 400,
          message: 'question is required',
        });
      }

      const q = question.trim();
      if (q.length < 2) {
        return res.status(400).json({
          code: 400,
          message: 'Question is too short',
        });
      }

      if (q.length > maxQuestionLength) {
        return res.status(400).json({
          code: 400,
          message: `Question length cannot exceed ${maxQuestionLength} characters`,
        });
      }

      // 调用服务
      const data = await service.askGeneral({ question: q });

      res.json({
        code: 0,
        data,
      });
    } catch (err: any) {
      next(err);
    }
  });

  return router;
}

/**
 * 错误处理中间件
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('AI Assistant Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    code: status,
    message,
  });
}

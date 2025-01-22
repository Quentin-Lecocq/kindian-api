import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Supabase } from './supabase/supabase';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabase: Supabase,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-supabase')
  async testSupabase() {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from('books')
        .select('*')
        .limit(1);

      if (error) {
        return { status: 'error', message: error.message };
      }

      return {
        status: 'success',
        message: 'Connexion à Supabase réussie !',
        data,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Erreur de connexion à Supabase',
        error: (error as Error).message,
      };
    }
  }
}

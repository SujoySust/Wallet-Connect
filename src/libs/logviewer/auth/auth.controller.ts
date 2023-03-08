/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Controller,
  Get,
  Render,
  Request,
  Res,
  UseGuards,
  Post,
  UseFilters,
  Query,
  Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  AuthenticatedGuard,
  AuthGuardFilter,
  NoAuthGuardFilter,
  UnAuthenticatedGuard,
} from './authenticated.guard';
import { LocalAuthGuard } from './local-auth.guard';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  @UseGuards(UnAuthenticatedGuard)
  @UseFilters(NoAuthGuardFilter)
  @Get('login')
  @Render('login')
  async loginPage(@Query('redirect') redirect: string) {
    return { redirect: redirect || '/logs' };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    //let html = `<a id="logv" href="/logs">Go to Logviewer</a>`;
    const html = `<script> window.location.href='${req.body.redirect}'; </script>`;
    return html;
  }

  @UseGuards(AuthenticatedGuard)
  @UseFilters(AuthGuardFilter)
  @Get('logout')
  async logout(@Request() req, @Res() res) {
    req.session.destroy();
    return res.redirect('/auth/login');
  }
}

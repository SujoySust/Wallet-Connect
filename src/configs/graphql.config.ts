import { registerAs } from '@nestjs/config';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { errorResponse } from 'src/app/helpers/functions';
import { newConsole } from 'src/libs/log/logger.service';
import { GraphqlConfig } from './config.interface';

export const GraphQLConfig = registerAs(
  'graphql',
  (): GraphqlConfig => ({
    playgroundEnabled: process.env.APP_DEBUG == 'true' ? true : false,
    debug: process.env.APP_DEBUG == 'true' ? true : false,
    introspection: process.env.APP_DEBUG == 'true' ? true : false,
    schemaDestination: './graphql/schema.gql',
    sortSchema: true,
    formatError: (error: GraphQLError): GraphQLFormattedError => {
      let message: string;
      let messages: string[];
      let code: number;
      try {
        if (error.extensions.hasOwnProperty('exception')) {
          message = error.message;
          code = error.extensions.exception.response.code;
          if (code === 500) code = error.extensions.exception.status || 500;
        } else {
          if (Array.isArray(error.extensions.response.message)) {
            messages = error.extensions.response.message;
            message = error.extensions.response.message[0];
          } else {
            message = error.extensions.response.message;
          }
          code = error.extensions.response.statusCode;
        }
        return errorObj(message, messages, code);
      } catch (e) {
        if (
          error.extensions.code === 'GRAPHQL_VALIDATION_FAILED' ||
          error.extensions.code === 'BAD_USER_INPUT' ||
          error.extensions.code === 'GRAPHQL_PARSE_FAILED' ||
          error.message.search(/Must provide operation name/i) > -1
        )
          return errorObj(error.message, [], 400);
        else {
          let message = '';
          if (error.message.search(/File truncated/) >= 0) {
            message = error.message;
          }
          newConsole.error(JSON.stringify(error));
          return errorObj(message || errorResponse().message);
        }
      }
    },
  }),
);

function errorObj(message, messages?, code?) {
  return <any>{
    message: message,
    messages: messages ?? [],
    code: code || 500,
  };
}

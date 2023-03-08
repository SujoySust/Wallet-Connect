import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type. Basically string';

  parseValue(value: string): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): string {
    return new Date(value).toISOString(); // value sent to the client
  }

  parseLiteral(ast: any): Date {
    if (ast.kind === Kind.INT || Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
}

import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { Kind } from 'graphql';

@Scalar('Decimal', () => Decimal)
export class DecimalScalar implements CustomScalar<string, number> {
  description = 'Decimal custom scalar type. Basically string or number';

  parseValue(value: string): number {
    return Number(value); // value from the client
  }

  serialize(value: Decimal): string {
    return value.toString(); // value sent to the client
  }

  parseLiteral(ast: any): number {
    if (ast.kind === Kind.FLOAT || Kind.STRING) {
      return Number(ast.value);
    }
    return null;
  }
}

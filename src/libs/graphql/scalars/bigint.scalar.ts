import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';

@Scalar('BigInt', () => BigInt)
export class BigIntScalar implements CustomScalar<string, BigInt> {
  description = 'Date custom scalar type. Basically string or number';

  parseValue(value: string): BigInt {
    return BigInt(value); // value from the client
  }

  serialize(value: BigInt): string {
    return String(value); // value sent to the client
  }

  parseLiteral(ast: any): BigInt {
    if (ast.kind === Kind.INT || Kind.STRING) {
      return BigInt(ast.value);
    }
    return null;
  }
}

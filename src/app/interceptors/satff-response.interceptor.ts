import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { isArray } from 'class-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilesystemService } from '../filesystem/filesystem.service';
import { app, getCountry } from '../helpers/functions';
import { Staff } from '../modules/staff/staff.model';

export interface Response<T> {
  data: T;
}

@Injectable()
export class StaffResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (!data) return data;
        if (!isArray(data)) {
          if (data.edges && data.edges.length) {
            data.edges.forEach((edge) => {
              processStaff(edge.node);
            });
          } else {
            processStaff(data);
          }
        } else if (data.length) {
          data.forEach((staff) => {
            processStaff(staff);
          });
        }
        return data;
      }),
    );
  }
}

function processStaff(staff: Staff) {
  const fileService = app.get(FilesystemService);
  staff.avatar = fileService.url(staff.avatar);
  //staff.country = staff.country ? getCountry(staff.country) : staff.country;
}

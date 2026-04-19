import { HttpService } from "@nestjs/axios";
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { AxiosError } from "axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ExternalService {
  private readonly userServiceUrl =
    process.env.USER_SERVICE_URL ?? "http://172.16.42.129:3000";
  private readonly foodServiceUrl =
    process.env.FOOD_SERVICE_URL ?? "http://174.16.43.174:3003";

  constructor(private readonly httpService: HttpService) {}

  async validateUser(userId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${userId}`),
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new UnauthorizedException("User is not authorized");
        }

        if (error.response?.status === 404) {
          throw new NotFoundException("User not found");
        }
      }

      throw new BadGatewayException("User service is unavailable");
    }
  }

  async getFoodInfo(
    foodId: number,
  ): Promise<{ id: number; price: number | string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.foodServiceUrl}/foods/${foodId}`),
      );

      const payload = response.data as
        | { id: number; price: number | string }
        | { data: { id: number; price: number | string } };
      const data =
        payload && typeof payload === "object" && "data" in payload
          ? payload.data
          : payload;

      if (!data || data.price === undefined || data.price === null) {
        throw new NotFoundException(`Food ${foodId} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new NotFoundException(`Food ${foodId} not found`);
      }

      throw new BadGatewayException("Food service is unavailable");
    }
  }
}

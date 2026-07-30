import { createDataProvider, CreateDataProviderOptions } from '@refinedev/rest';
import { BACKEND_BASE_URL } from '@/constants';
import { CreateResponse, ListResponse } from '@/types';
import { HttpError } from '@refinedev/core';
import type { GetOneResponse } from '@/types';

if(!BACKEND_BASE_URL) {
  throw new Error('BACKEND_BASE_URL is not configured. please set VITE_BACKEND_BASE_URL in your .env file')
}

const buildHttpError = async (response: Response ): Promise<HttpError> => {
  let message = 'Request Failed.';

  try {
    const payload = (await response.json()) as {message?: string; error?: string}

    if(payload?.error) message = payload.error;
    else if(payload?.message) message = payload.message;
  }catch{
    // ignore errors
  }
  return {
    message,
    statusCode: response.status
  }
}

const options: CreateDataProviderOptions = {

  getList: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, unknown> = { page, limit: pageSize };

      filters?.forEach((filter) => {
        const field = 'field' in filter ? filter.field : '';
        const value = String(filter.value);

        if (resource === 'subjects') {
          if (field === 'department') {
            params.department = value;
          } else if (field === 'name' || field === 'code') {
            params.search = value;
          } else if (field && value) {
            params[field] = value;
          }
        } else if (resource === 'classes') {
          if (field === 'name') {
            params.search = value;
          } else if (field === 'subject') {
            params.subject = value;
          } else if (field === 'teacher') {
            params.teacher = value;
          } else if (field && value) {
            params[field] = value;
          }
        } else if (resource === 'departments') {
          if (field === 'name' || field === 'code') {
            params.search = value;
          } else if (field && value) {
            params[field] = value;
          }
        } else if (resource === 'users') {
          if (field === 'name' || field === 'email') {
            params.search = value;
          } else if (field === 'role') {
            params.role = value;
          } else if (field && value) {
            params[field] = value;
          }
        } else if (field && value) {
          params[field] = value;
        }
      });
      return params;
    },

    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);
      const payload: ListResponse = await response.clone().json();
      return payload.data ?? [];
    },
    getTotalCount: async (response) => {
      if (!response.ok) return 0;
      const payload: ListResponse = await response.clone().json();
      return payload.pagination?.total ?? payload.pagination?.totalCount ?? payload.data?.length ?? 0;
    },
  },

  create: {
    getEndpoint: ({ resource }) => resource,
    buildBodyParams: async ({ variables}) => variables,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json: CreateResponse = await response.json();
      return json.data ?? []
    }
  },

  update: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,
    getRequestMethod: () => 'PATCH',
    buildBodyParams: async ({ variables }) => variables,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json: GetOneResponse = await response.json();
      return json.data ?? {};
    },
  },

  deleteOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json = await response.json() as GetOneResponse;
      return json.data ?? {};
    },
  },

  getOne: {
    getEndpoint: ({resource, id}) => `${resource}/${id}`,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      const json: GetOneResponse = await response.json();
      if (json.data == null) {
        throw new Error("Get-one response did not contain data");
      }
      return json.data;
    }
  }
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };

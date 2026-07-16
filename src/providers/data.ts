import { DataProvider, GetListParams, GetListResponse, BaseRecord } from "@refinedev/core";
import { Subject } from '../types/index'

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource}: GetListParams): Promise<GetListResponse<TData>> => {
      if(resource !== 'subjects')return { data: [] as TData[], total: 0};

      const subjects: Subject[] = [
        {
          id: 1,
          code: "CS101",
          name: "Introduction to Computer Science",
          department: "CS",
          description: "An overview of computing concepts, programming fundamentals, and problem-solving techniques using Python.",
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          code: "MATH201",
          name: "Linear Algebra",
          department: "MATH",
          description: "A study of vector spaces, linear transformations, matrices, eigenvalues, and their applications in engineering and science.",
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          code: "ENG105",
          name: "Academic Writing and Research",
          department: "ENGLISH",
          description: "Develops critical thinking and academic writing skills, focusing on research methodologies, argumentation, and citing sources properly.",
          createdAt: new Date().toISOString()
        }
      ];

      return{
        data: subjects as unknown as TData[],
        total: subjects.length,
      }
    },
    getOne: async () => {throw new Error('This function is not present in mock')},
    create: async () => {throw new Error('This function is not present in mock')},
    update: async () => {throw new Error('This function is not present in mock')},
    deleteOne: async () => {throw new Error('This function is not present in mock')},

    getApiUrl: () => '',
}
'use client';

import { DataTable } from '~/components/DataTable/DataTable';
import { InterviewColumns } from '~/app/(dashboard)/dashboard/_components/InterviewsTable/Columns';
import { trpc } from '~/app/_trpc/client';
import { type Interview } from '@prisma/client';

type InterviewWithoutNetwork = Omit<Interview, 'network'>;

export const InterviewsTable = () => {
  const interviews = trpc.interview.get.all.useQuery();
  const { mutateAsync: deleteInterview } =
    trpc.interview.deleteSingle.useMutation({
      async onSuccess() {
        await interviews.refetch();
      },
    });

  const { mutateAsync: deleteInterviews } =
    trpc.interview.deleteMany.useMutation({
      async onSuccess() {
        await interviews.refetch();
      },
    });

  const handleDelete = async (id: string) => {
    const result = await deleteInterview({ id });
    if (result.error) throw new Error(result.error);
  };

  if (!interviews.data) {
    return <div>Loading...</div>;
  }

  const convertedData: InterviewWithoutNetwork[] = interviews.data.map(
    (interview) => ({
      ...interview,
      startTime: new Date(interview.startTime),
      finishTime: interview.finishTime ? new Date(interview.finishTime) : null,
      exportTime: interview.exportTime ? new Date(interview.exportTime) : null,
      lastUpdated: new Date(interview.lastUpdated),
    }),
  );

  return (
    <DataTable
      columns={InterviewColumns(handleDelete)}
      data={convertedData}
      filterColumnAccessorKey="id"
      handleDeleteSelected={async (data: InterviewWithoutNetwork[]) => {
        try {
          await deleteInterviews(data);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }}
    />
  );
};
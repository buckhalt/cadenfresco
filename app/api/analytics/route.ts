import { getInstallationId } from '~/analytics/utils';
import { env } from '~/env.mjs';
import { createRouteHandler } from '@codaco/analytics';
import { WebServiceClient } from '@maxmind/geoip2-node';

const routeHandler = createRouteHandler({
  maxMindAccountId: env.MAXMIND_ACCOUNT_ID,
  maxMindLicenseKey: env.MAXMIND_LICENSE_KEY,
  getInstallationId,
  platformUrl: 'http://localhost:3001',
  WebServiceClient,
});

export { routeHandler as POST };

import {APIGatewayEvent} from 'aws-lambda';

import {SearchRequest, SearchResponse} from './package-search.d';
import {PackageSearch} from './package-search';
import {DlPackageTags} from './tagging/package-tags';
import {Lambda} from 'aws-sdk';

const lambda = new Lambda({apiVersion: '2015-03-31'});

export async function handle(request: any) {
    console.log('REQUEST', JSON.stringify(request));
    try {
        validateEnvVariables();

        return request.httpMethod
            ? await apiGatewayResponse(packageSearch(), request)
            : await invocationResponse(packageSearch(), request);

    } catch (err) {
        console.error('ERROR', err);
        throw err;
    }
}

function packageSearch() {
    return new PackageSearch(
        new DlPackageTags(process.env.TAGGING_LAMBDA, lambda)
    );
}

async function invocationResponse(search: PackageSearch, request: SearchRequest): Promise<SearchResponse> {
    return await search.response(request);
}

async function apiGatewayResponse(search: PackageSearch, event: APIGatewayEvent): Promise<HttpResponse> {
    try {
        const response = await search.response(searchRequest(event));
        return httpResponse(200, response);

    } catch (err) {
        return httpResponse(400, err.message);
    }
}

function searchRequest(event: APIGatewayEvent): SearchRequest {
    return {
        ...JSON.parse(event.body),
        tenantId: event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.tenantId
    }
}

function httpResponse(statusCode: number, data: SearchResponse): HttpResponse {
    return {
        isBase64Encoded: false,
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    } as HttpResponse;
}

function validateEnvVariables() {
    if (!process.env.TAGGING_LAMBDA) {
        throw new Error('TAGGING_LAMBDA environment variable is not defined.');
    }
}

interface HttpResponse {
    statusCode: number,
    headers: { [key: string]: string },
    body?: any,
}
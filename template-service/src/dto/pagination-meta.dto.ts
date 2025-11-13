import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
    @ApiProperty({ example: 500, description: 'Total number of records available.' })
    total: number;

    @ApiProperty({ example: 10, description: 'Maximum number of items per page.' })
    limit: number;

    @ApiProperty({ example: 1, description: 'Current page number.' })
    page: number;

    @ApiProperty({ example: 50, description: 'Total number of pages.' })
    total_pages: number;

    @ApiProperty({ example: true, description: 'Indicates if there is a next page.' })
    has_next: boolean;

    @ApiProperty({ example: false, description: 'Indicates if there is a previous page.' })
    has_previous: boolean;
}
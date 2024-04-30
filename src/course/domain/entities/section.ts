import { Entity } from "src/common/Domain/domain-object/entity.interface"
import { Video } from "./compose-fields/video"
import { Image } from "./compose-fields/image"
import { Paragraph } from './compose-fields/paragraph'
import { Comment } from "./comment"



export class Section extends Entity<string>
{

    private name: string
    private description: string
    private videos?: Video[]
    private images?: Image[]
    private paragraphs?: Paragraph[]
    private comments: Comment[] = []

    protected constructor ( id: string, name: string, description: string, videos?: Video[], images?: Image[], paragraphs?: Paragraph[] )
    {
        super( id )
        this.name = name
        this.description = description
        this.videos = videos
        this.images = images
        this.paragraphs = paragraphs
        this.ensureValidState()
    }

    get Name (): string
    {
        return this.name
    }

    get Description (): string
    {
        return this.description
    }

    get Videos (): Video[]
    {
        return this.videos
    }

    get Images (): Image[]
    {
        return this.images
    }

    get Paragraphs (): Paragraph[]
    {
        return this.paragraphs
    }

    get Comments (): Comment[]
    {
        return this.comments
    }

    protected ensureValidState (): void
    {
        if ( !this.name )
            throw new Error( "Section must have a name" )

    }

    addComment ( comment: Comment ): void
    {
        this.comments.push( comment )
    }

    static create ( id: string, name: string, description: string, videos?: Video[], images?: Image[], paragraphs?: Paragraph[] ): Section
    {
        return new Section( id, name, description, videos, images, paragraphs )
    }



}
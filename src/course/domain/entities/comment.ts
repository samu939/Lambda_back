import { Entity } from "src/common/Domain/domain-object/entity.interface"




export class Comment extends Entity<string>
{

    private userId: string
    private text: string
    private date: Date

    protected constructor ( id: string, userId: string, text: string, date: Date )
    {
        super( id )
        this.userId = userId
        this.text = text
        this.date = date
        this.ensureValidState()
    }

    protected ensureValidState (): void
    {
        if ( !this.userId )
            throw new Error( "Comment must have a user" )

        if ( !this.text )
            throw new Error( "Comment must have a text" )

        if ( !this.date )
            throw new Error( "Comment must have a valid date" )

    }

    static create ( id: string, userId: string, text: string ): Comment
    {
        return new Comment( id, userId, text, new Date() )
    }

}
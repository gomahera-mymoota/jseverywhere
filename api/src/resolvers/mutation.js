export default { 
    newNote: async (parent, args, { models }) => await models.Note.create({
        content: args.content,
        author: 'IceMan4U'
    })
}

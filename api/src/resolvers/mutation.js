export default { 
    newNote: async (parent, args, { models }) => await models.Note.create({
        content: args.content,
        author: 'IceMan4U'
    }),
    deleteNote: async (parent, { id }, { models }) => {
        try {
            await models.Note.findOneAndDelete({ _id: id });
            return true;
        } catch (err) {
            return false;
        }
    },
    updateNote: async (parent, { content, id }, { models }) => 
        await models.Note.findOneAndUpdate(
            {
                _id: id,
            },
            {
                $set: {
                    content
                }
            },
            {
                new: true
            }
        ),
}

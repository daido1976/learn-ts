FROM public.ecr.aws/shelf/lambda-libreoffice-base:7.6-node20-x86_64

COPY ./ ${LAMBDA_TASK_ROOT}/

RUN npm install

CMD [ "index.handler" ]
